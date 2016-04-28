var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var sh = require('shelljs');

var paths = {
  tochka_css: ['./www/css/tochka/*.css']
};



gulp.task('mincss', function(){
    return gulp.src('styles/*.css')
        .pipe(cleanCSS(paths.tochka_css))
        .pipe(gulp.dest(paths.tochka_css));
});



gulp.task('default', ['watch']);
