var gulp = require('gulp')
var rm = require('gulp-rimraf')
var include = require('gulp-include')
var prettify = require('gulp-jsbeautifier')
var rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var gzip = require('gulp-gzip')
var concat = require('gulp-concat')

var runSequence = require('run-sequence');

var version = require('./package.json').version
var filenameBase = 'helm-' + version

var concatSource = function (sources, name) {
  return gulp.src(sources)
    .pipe(rename(name))
    .pipe(include())
    .pipe(prettify({
      indentSize: 2,
      indentChar: ' ',
      indentWithTabs: false
    }))
    .pipe(gulp.dest('./dist/'))
}

var concatSourceDeps = function (sources, name) {
  return gulp.src(sources)
    .pipe(concat(name))
    .pipe(include())
    .pipe(prettify({
      indentSize: 2,
      indentChar: ' ',
      indentWithTabs: false
    }))
    .pipe(gulp.dest('./dist/'))
}

var minifySource = function (source, name) {
  return gulp.src(source)
    .pipe(rename(name + '.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: false
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
}

var gzipSource = function (source) {
  return gulp.src(source)
    .pipe(gzip())
    .pipe(gulp.dest('./dist/'))
}

gulp.task('build', function (done) {
  runSequence('clean', 'concat', 'minify', 'gzip', done)
})

gulp.task('build_legacy', function(done) {
  runSequence('concat_legacy', 'minify_legacy', 'gzip_legacy', done)
})

gulp.task('build_modern', function(done) {
  runSequence('concat_modern', 'minify_modern', 'gzip_modern', done)
})

gulp.task('build_all', function () {
  runSequence('build', ['build_legacy', 'build_modern'])
})

gulp.task('clean', function () {
  return gulp.src('./dist', {read: false})
    .pipe(rm({force: true}))
})

gulp.task('concat', function () {
  return concatSource('./src/helm.js', filenameBase + '.js')
})

gulp.task('minify', function () {
  var source = './dist/' + filenameBase + '.js'
  return minifySource(source, filenameBase)
})

gulp.task('gzip', function () {
  return gzipSource('./dist/' + filenameBase + '.min.js')
})

gulp.task('concat_legacy', function () {
  var sources = ['./src/legacy-dependencies.js', './dist/' + filenameBase + '.js']
  var outputName = filenameBase + '-legacy-deps.js'

  return concatSourceDeps(sources, outputName)
})

gulp.task('minify_legacy', function () {
  var source = './dist/' + filenameBase + '-legacy-deps.js'
  return minifySource(source, filenameBase + '-legacy-deps')
})

gulp.task('gzip_legacy', function () {
  return gzipSource('./dist/' + filenameBase + '-legacy-deps.min.js')
})

gulp.task('concat_modern', function () {
  var sources = ['./src/modern-dependencies.js'] //, './dist/' + filenameBase + '.js'
  var outputName = filenameBase + '-modern-deps.js'

  return concatSourceDeps(sources, outputName)
})

gulp.task('minify_modern', function () {
  var source = './dist/' + filenameBase + '-modern-deps.js'
  return minifySource(source, filenameBase + '-modern-deps')
})

gulp.task('gzip_modern', function () {
  return gzipSource('./dist/' + filenameBase + '-modern-deps.min.js')
})
