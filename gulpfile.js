
var srcPath = 'src',
    scriptsSrcPath = srcPath + '/**/*.js',
    distPath = 'dist',

    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src(scriptsSrcPath)
      .pipe(plugins.plumber())
      .pipe(plugins.concat('hex-grid.js'))
      .pipe(gulp.dest(distPath))
      .pipe(plugins.filesize())
      .pipe(plugins.rename({ suffix: '.min' }))
      .pipe(plugins.uglify())
      .pipe(gulp.dest(distPath))
      .pipe(plugins.filesize())
      .pipe(plugins.notify({ message: 'scripts task complete' }))
      .pipe(plugins.livereload());
});

gulp.task('clean', function () {
  return gulp.src([distPath], {read: false})
      .pipe(plugins.clean());
});

gulp.task('default', ['clean'], function () {
  gulp.start('server', 'scripts', 'watch');
});

gulp.task('watch', function () {
  gulp.watch(scriptsSrcPath, ['scripts']);
});

gulp.task('server', function () {
  plugins.nodemon({script: 'example/main.js'});
});
