/**
 *  VTEX Starter Speed
 *  
 */

'use strict';

// Include gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect	= require('gulp-connect');
var packageJson = require('./package.json');

var environment = process.env.VTEX_HOST || 'vtexcommercestable';
var url = packageJson.accountName && !gutil.env.no ? 'http://' + packageJson.accountName + '.vtexlocal.com.br/?debugcss=true&debugjs2=true' : '';

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(connect.reload())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

// Concatenate and minify JavaScript
gulp.task('scripts', function () {
  var sources = ['./src/scripts/**/*.js'];
  return gulp.src(sources)
    // .pipe($.concat('main.min.js'))
    // .pipe($.uglify({preserveComments: 'some'}))
    // Output files
    .pipe(gulp.dest('build/arquivos'))
    .pipe($.size({title: 'scripts'}));
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('build/arquivos'))
    .pipe($.size({title: 'images'}));
});

gulp.task('sass', function () {
  return sass('src/styles', {sourcemap: false, noCache: true, style:'expanded'})
    .on('error', function (err) {
        console.error('Error! ', err.message);
    })
    .pipe(sourcemaps.write())
	// .pipe(gulp.dest(paths.dest))
	// .pipe(rename({suffix: '.min'}))
	// .pipe(minifycss())
  	.pipe(gulp.dest('build/arquivos'))
  	.pipe($.size({title: 'sass'}))
	.pipe(connect.reload());
});

gulp.task('css', function () {
  return gulp.src('src/styles/**/*.css')
	.pipe(gulp.dest('build/arquivos'))
	.pipe($.size({title: 'css'}))
	.pipe(connect.reload());
});


gulp.task('connect', function () {
	connect.server({
		host: '*',
		root: './build/',
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
				url ? require('open')(url) : gutil.noop(),
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
	gulp.watch(['src/scripts/**/*.js'], ['jshint', 'scripts']);
	gulp.watch(['src/styles/**/*.scss'], ['sass']);
	gulp.watch(['src/styles/**/*.css'], ['css']);
	gulp.watch(['src/images/**/*'], ['images']);
});

gulp.task('default', ['connect', 'watch', 'scripts', 'sass', 'css', 'images']);
gulp.task('build', ['default']);