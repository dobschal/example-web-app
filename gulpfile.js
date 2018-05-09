
//  CONFIG
const filesToCopy = ["./src/index.html", "./src/service-worker.js", "./src/offline.manifest"];
const sassFiles = './src/scss/';
const sassEntry = 'import.scss';
const jsFiles = "./src/js/";
const jsEntry = "app.js";
const buildPath = "./build";

//
//
//  DO NOT CHANGE SOMETHING BELOW
//
//

//  DEPENDENCIES
const gulp    = require('gulp'),
    connect = require('gulp-connect'),
    sass    = require('gulp-sass'),
    browserify = require('gulp-browserify');

// START SERVER
gulp.task('connect', function() {
    connect.server({
        port: 1234
    });
});

// BUILD TASKS
gulp.task('sass', function () {
    return gulp.src( sassFiles + sassEntry )
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(buildPath));
});

gulp.task("copy", function() {
    return gulp
      .src( filesToCopy )
      .pipe(gulp.dest(buildPath));
});
 
gulp.task('scripts', function() {
    gulp.src(jsFiles + jsEntry)
        .pipe(browserify({
          insertGlobals : false,
          debug : true
        }))
        .pipe(gulp.dest(buildPath))
});


//  WATCH FOR CHANGES AND EXECUTE TASKS AUTOMATICALLY
gulp.task('watch', function () {
    gulp.watch(sassFiles + '**/*.scss', ['sass']);
    gulp.watch(filesToCopy, ['copy']);
    gulp.watch(jsFiles + '**/*.js', ['scripts']);
});

gulp.task('default', ['sass', 'copy', 'scripts', 'connect', 'watch']);