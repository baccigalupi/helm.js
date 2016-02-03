var gulp = require('gulp')
var rm = require('gulp-rimraf')
var include = require('gulp-include')
var prettify = require('gulp-jsbeautifier')
var rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var gzip = require('gulp-gzip')
var concat = require('gulp-concat')

var version = require('./package.json').version
var filenameBase = 'helm-' + version

gulp.task('concat', ['clean'], function () {
  gulp.src('./src/helm.js')
    .pipe(rename(filenameBase + '.js'))
    .pipe(include())
    .pipe(prettify({
      indentSize: 2,
      indentChar: ' ',
      indentWithTabs: false
    }))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('concat_full', function () {
  gulp.src(['./src/dependencies.js', './dist/' + filenameBase + '.js'])
    .pipe(concat(filenameBase + '-full.js'))
    .pipe(include())
    .pipe(prettify({
      indentSize: 2,
      indentChar: ' ',
      indentWithTabs: false
    }))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('minify', function () {
  gulp.src('./dist/' + filenameBase + '.js')
    .pipe(rename(filenameBase + '.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: false
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('minify_full', function () {
  gulp.src('./dist/' + filenameBase + '-full.js')
    .pipe(rename(filenameBase + '-full.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: false
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('gzip', function () {
  gulp.src('./dist/' + filenameBase + '.min.js')
    .pipe(gzip())
    .pipe(gulp.dest('./dist/'))
})

gulp.task('gzip_full', function () {
  gulp.src('./dist/' + filenameBase + '-full.min.js')
    .pipe(gzip())
    .pipe(gulp.dest('./dist/'))
})

gulp.task('clean', function () {
  gulp.src('./dist', {read: false})
    .pipe(rm({force: true}))
    .on('error', function () {})
})
