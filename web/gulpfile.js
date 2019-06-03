var gulp = require('gulp'),
    inject = require('gulp-inject'),
    webserver = require('gulp-webserver');

var paths = {
    src: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/**/*.css',
    srcJS: 'src/**/*.js',
    srcIMG: 'src/**/*.png',

    tmp: 'tmp',
    tmpIndex: 'tmp/index.html',
    tmpCSS: 'tmp/**/*.css',
    tmpJS: 'tmp/**/*.js',
    tmpIMG: 'tmp/**/*.png',

    dist: 'dist',
    distIndex: 'dist/index.html',
    distCSS: 'dist/**/*.css',
    distJS: 'dist/**/*.js',
    distIMG: 'dist/**/*.png',
};

gulp.task('html', function () {
    return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});

gulp.task('css', function () {
    return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
});

gulp.task('js', function () {
    return gulp.src(paths.srcIMG).pipe(gulp.dest(paths.tmp));
});

gulp.task('img', function () {
    return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'css', 'js','img']);

gulp.task('inject', ['copy'], function () {
    var css = gulp.src(paths.tmpCSS);
    var js = gulp.src(paths.tmpJS);
    return gulp.src(paths.tmpIndex)
        .pipe(inject(css, { relative: true }))
        .pipe(inject(js, { relative: true }))
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function () {
    return gulp.src(paths.tmp)
        .pipe(webserver({
            port: 3000,
            livereload: true,
            host: '0.0.0.0'
        }));
});

gulp.task('watch', ['serve'], function () {
    gulp.watch(paths.src, ['inject']);
});


gulp.task('default', ['watch']);