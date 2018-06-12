
//  CONFIG
const filesToCopy = ["./src/html/index.html", "./src/js/service-worker.js" ];
const fontsToCopy = ["./node_modules/font-awesome/fonts/**"];
const imagesToCopy = ["./node_modules/lightbox2/dist/images/**", "./assets/**"];
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
    replace = require('gulp-replace'),
    eslint = require('gulp-eslint'),
    htmlLint = require('gulp-html-lint');

//  replacment of placeholders
gulp.task('use-prod-api', ["compress-scripts"], function(){
    gulp.src([buildPath + '/js/app.min.js'])
    .pipe(replace('#SERVER_URL#', 'https://www.dobschal.eu'))
    .pipe(gulp.dest( buildPath + "/js/" ));
});
gulp.task('use-dev-api', ["compile-scripts"], function(){
    gulp.src([buildPath + '/js/app.js'])
    .pipe(replace('#SERVER_URL#', 'http://localhost:3001'))
    .pipe(gulp.dest( buildPath + "/js/" ));
});
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
        port: 3002,
        buildPath: "./build"
    });
});

// BUILD TASKS

gulp.task('lint-templates', function() {
    return gulp.src('src/html/**/*.html')
        .pipe(htmlLint({
            rules: {
                "attr-new-line": false,
                "id-class-style": "dash",
                "attr-name-style": "dash",
                "line-end-style": false,
                "img-req-src": false,
                "img-req-alt": false,
                "label-req-for": false // may be useful!
            }
        }))
        .pipe(htmlLint.format())
        .pipe(htmlLint.failOnError());
});
 
gulp.task('lint-scripts', ['lint-templates'], () => {
    return gulp.src([ './src/js/**/*.js' ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

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

gulp.task("copy-images", function() {
    return gulp
      .src( imagesToCopy )
      .pipe(gulp.dest(buildPath + "/images"));
});
 
gulp.task('compile-scripts', [
    "lint-scripts",
    "lint-templates" 
], function() {
    return gulp.src(jsFiles + jsEntry)
        .pipe(rename('app.js'))
        .pipe(browserify({ debug: true, list: true }))
        .pipe(gulp.dest(buildPath + "/js"))
});
 
gulp.task('compress-scripts', ['compile-scripts'], function () {
    return gulp.src( buildPath + "/js/app.js" )
        .pipe(rename("app.min.js"))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest(buildPath + "/js"));
});

gulp.task('watch-prod', function () {
    gulp.watch('./src/**', [
        'build-prod'
    ]);
});

gulp.task('build-dev', [
    'compile-sass', 
    'copy-files', 
    'copy-fonts', 
    'copy-images',
    "lint-templates",
    "lint-scripts",
    'compile-scripts',
    "use-dev-api",
    "use-uncompressed-app",
    'update-service-worker-version'
]);

gulp.task('build-prod', [
    'compile-sass', 
    'copy-files', 
    'copy-fonts', 
    'copy-images',
    "lint-templates",
    "lint-scripts",
    'compile-scripts',    
    'compress-scripts',
    "use-dev-api", // app.js, localhost
    "use-prod-api", // app.min.js, online
    "use-compressed-app",
    'update-service-worker-version'
]);

gulp.task('dev', [
    "build-dev"
]);

gulp.task('prod', [
    "build-prod"
]);

gulp.task('watch', [
    "watch-prod"
]);

gulp.task('server', [
    "connect"
]);