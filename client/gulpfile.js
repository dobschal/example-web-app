
//  CONFIG
const filesToCopy = ["./src/html/index.html", "./src/js/service-worker.js"];
const fontsToCopy = ["./node_modules/font-awesome/fonts/**"];
const sassFiles = './src/scss/';
const sassEntry = 'app.scss';
const jsFiles = "./src/js/";
const jsEntry = "router.js";
const htmlFiles = "./src/html/**/*.html";
const buildPath = "./build";

//  DEPENDENCIES
const gulp    = require('gulp'),
    connect = require('gulp-connect'),
    sass    = require('gulp-sass'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    replace = require('gulp-replace');

//  replace
gulp.task('use-compressed-app', ["copy-files"], function(){
    gulp.src([buildPath + '/index.html'])
    .pipe(replace('#APP_SOURCE#', './js/app.min.js'))
    .pipe(gulp.dest( buildPath ));
});
gulp.task('use-uncompressed-app', ["copy-files"], function(){
    gulp.src([buildPath + '/index.html'])
    .pipe(replace('#APP_SOURCE#', './js/app.js'))
    .pipe(gulp.dest( buildPath ));
});
gulp.task('update-service-worker-version', ["copy-files"], function(){
    gulp.src([buildPath + '/service-worker.js'])
    .pipe(replace('#CODE_VERSION#', "VersionOf" + Date.now()))
    .pipe(gulp.dest( buildPath ));
});

// START SERVER
gulp.task('connect', function() {
    connect.server({
        port: 1234,
        buildPath: "./build"
    });
});

// BUILD TASKS
gulp.task('compile-sass', function () {
    return gulp.src( sassFiles + sassEntry )
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(buildPath + "/css"));
});

gulp.task("copy-files", function() {
    return gulp
      .src( filesToCopy )
      .pipe(gulp.dest(buildPath));
});

gulp.task("copy-fonts", function() {
    return gulp
      .src( fontsToCopy )
      .pipe(gulp.dest(buildPath + "/fonts"));
});
 
gulp.task('compile-scripts', function() {
    return gulp.src(jsFiles + jsEntry)
        .pipe(rename('app.js'))
        .pipe(browserify({ debug: true }))        
        .pipe(gulp.dest(buildPath + "/js"))
});
 
gulp.task('compress-scripts', ['compile-scripts'], function () {
    return gulp.src( buildPath + "/js/app.js" )
        .pipe(rename("app.min.js"))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest(buildPath + "/js"));
});

gulp.task('watch', ['connect'], function () {
    gulp.watch(sassFiles + '**/*.scss', [
        'compile-sass', 
        'copy-files', 
        'update-service-worker-version'
    ]);
    gulp.watch(filesToCopy, [
        'copy-files', 
        'update-service-worker-version'
    ]);
    gulp.watch(jsFiles + '**/*.js', [
        'compile-scripts', 
        'copy-files',
        "use-uncompressed-app",        
        'update-service-worker-version'
    ]);
    gulp.watch(htmlFiles, [
        'compile-scripts', 
        'copy-files',
        "use-uncompressed-app",        
        'update-service-worker-version'
    ]);
});

gulp.task('build-dev', [
    'compile-sass', 
    'copy-files', 
    'copy-fonts', 
    'compile-scripts',
    "use-uncompressed-app",
    'update-service-worker-version'
]);

gulp.task('build-prod', [
    'compile-sass', 
    'copy-files', 
    'copy-fonts', 
    'compile-scripts',    
    'compress-scripts',
    "use-compressed-app",
    'update-service-worker-version'
]);

gulp.task('dev', [
    "build-dev",
    'connect',
    "watch"
]);

gulp.task('prod', [
    "build-prod",
    'connect'
]);