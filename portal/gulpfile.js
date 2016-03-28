/**
 *  VTEX Starter
 */

"use strict";

var gulp		= require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins')(),
	gutil       = require('gulp-util'),
	plumber     = require('gulp-plumber'),
	imagemin	= require('gulp-imagemin'),
	jshint      = require('gulp-jshint'),
	uglify		= require('gulp-uglifyjs'),
	sass        = require('gulp-ruby-sass'),
	sourcemaps  = require('gulp-sourcemaps'),
	minifycss   = require('gulp-minify-css'),
	rename      = require('gulp-rename'),
	connect	    = require('gulp-connect'),
	changed		= require('gulp-changed'),
	ignore		= require('gulp-ignore'),
	// modrewrite  = require('connect-modrewrite'),
	packageJson = require('./package.json');

var environment = process.env.VTEX_HOST || 'vtexcommercestable';
var url = packageJson.accountName && !gutil.env.no ? 'http://' + packageJson.accountName + '.vtexlocal.com.br/?debugcss=true&debugjs2=true' : '';

// Lint JavaScript
gulp.task('lint', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(connect.reload())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
    // .pipe(jshint.reporter('default'));
});

// Concatenate and minify JavaScript
gulp.task('scripts', function () {
  var sources = ['./src/scripts/**/*.js'];
  return gulp.src(sources)
    // .pipe(gulpLoadPlugins.concat('main.min.js'))
    // .pipe(gulpLoadPlugins.uglify({preserveComments: 'some'}))
    // Output files
    .pipe(gulp.dest('build/arquivos/js'));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe(gulpLoadPlugins.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('build/arquivos/images'));
});

gulp.task('sass', function () {
  return sass('src/styles/*.scss', {sourcemap: false, noCache: true, style:'expanded'})
    .on('error', function (err) {
        console.error('Error! ', err.message);
    })
    .pipe(sourcemaps.write())
	.pipe(gulp.dest('build/arquivos/css'))
	// .pipe(rename({suffix: '.min'}))
	// .pipe(minifycss())
 //  	.pipe(gulp.dest('build/arquivos'))
	.pipe(connect.reload());
});

gulp.task('css', function () {
  return gulp.src('src/styles/**/*.css')
	.pipe(gulp.dest('build/arquivos/css'))
	.pipe(connect.reload());
});

gulp.task('connect', function(){
  connect.server({
  	host: '*',
    root: './build',
    port: 80,
    livereload: true,
    middleware: function (connect, opt) {
    	return [
    		require('connect-livereload')({
				disableCompression: true
			}),
			require('connect-http-please')({
				replaceHost: function (h) {
					return h.replace('vtexlocal', environment);
				}
			}),
			function(req, res, next) {
				req.headers.host = req.headers.host.replace('vtexlocal', environment);
				return next();
			},
			require('connect-tryfiles')('**', 'http://portal.' + environment + '.com.br:80', {
				cwd: 'build/'
			}),
			// url ? require('open')(url) : gutil.noop(),
			function(err, req, res, next) {
				var errString, _ref, _ref1;
				errString = (_ref = (_ref1 = err.code) != null ? _ref1.red : void 0) != null ? _ref : err.toString().red;
				return gutil.log(errString, req.url.yellow);
			}
    	];
    }
  });
});

gulp.task('watch', function () {
	gulp.watch(['src/scripts/**/*.js'], ['lint', 'scripts']);
	gulp.watch(['src/styles/**/*.scss'], ['sass']);
	gulp.watch(['src/styles/**/*.css'], ['css']);
	gulp.watch(['src/images/**/*'], ['images']);
});

gulp.task('default', ['connect', 'watch', 'scripts', 'sass', 'css', 'images']);
gulp.task('build', ['default']);