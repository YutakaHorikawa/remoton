var gulp        = require('gulp');
var glob        = require('glob');
var util        = require('gulp-util');
var source      = require('vinyl-source-stream');
var sourcemaps  = require('gulp-sourcemaps');
var browserify  = require('browserify');
var babelify    = require("babelify");
var buffer      = require('gulp-buffer');
var uglify      = require('gulp-uglify');

var ES6_PATH = __dirname + '/src/**/**/*.js';
var JS_DEST_PATH = './public/javascripts/';

var sassOption = {
    includePaths: require('node-bourbon').includePaths,
    indentWidth: 4,
    outputStyle: 'compressed',
};

gulp.task('transpile:js', function() {

    var errorHandler = function(err) {
        util.log(util.colors.red('Error'), err.message);
    };

    var src = glob.sync(ES6_PATH);
    browserify({
        entries: src,
        debug: true
    })
    .transform(babelify.configure({
        optional: ["es7.decorators"]
    }))
    .bundle()
    .on('error', errorHandler)
    .pipe( source('application.js') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( sourcemaps.init() )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest(JS_DEST_PATH) );

});

gulp.task('es6', function () {
    gulp.watch([ES6_PATH], ['transpile:js']);
});

