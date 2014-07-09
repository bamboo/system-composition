require('source-map-support').install();

var gulp = require('gulp');
var mjs = require('gulp-mjs');
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');
var es = require('event-stream');
var path = require('path');

var paths = {
  src: ['*.mjs'],
  dest: '.',
  test: {
    src: ['test/*.mjs'],
    dest: 'test'
  }
};

function build() {
  return compile(paths.src, paths.dest);
}

function compile(src, dest) {
  var errors = 0;
  return gulp
    .src(src)
    .pipe(plumber())
    .pipe(mjs({debug: true})).on('error', function (err) {
       ++errors;
       onError(err);
    })
    .pipe(plumber.stop())
    .on('end', function () { if (errors) process.exit(errors); })
    .pipe(gulp.dest(dest));
}

var javascriptFiles = es.map(function (data, callback) {
  if (isJavascriptFile(data))
    callback(null, data);
  else
    callback();
});

function test(reporter) {
  return compile(paths.test.src, paths.test.dest)
    .pipe(javascriptFiles)
    .pipe(mocha({reporter: reporter}));
}

function isJavascriptFile(f) {
  return f.path && path.extname(f.path) == '.js';
}

function onError(err) {
  console.warn(err.stack || err.message || err);
}

gulp.task('test', ['build'], function () { test('spec'); });

gulp.task('test-xunit', ['build'], function () { test('xunit'); });

gulp.task('build', build);

gulp.task('default', ['test']);
