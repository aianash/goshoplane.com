'use strict'

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var beep = require('beepbeep');
var path = require('path');
var open = require('open');
var streamqueue = require('streamqueue');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var coffee = require('gulp-coffee');
var coffeelint = require('gulp-coffeelint');
var nodemon = require('gulp-nodemon');

/**
 * Parse arguments
 */
var args = require('yargs')
    .alias('r', 'release')
    .alias('b', 'build')
    .default('build', true)
    .default('release', false)
    .argv;

var build = args.build || args.release;
var release = args.release;
var targetDir = path.resolve(release ? 'dist' : 'build');


// global error handler
var errorHandler = function(error) {
  if (build) {
    throw error;
  } else {
    beep(2, 170);
    plugins.util.log(error);
  }
};

// clean target dir
gulp.task('clean', function(done) {
  del([targetDir], done);
});

// lint coffeescript
gulp.task('coffeelint', function() {
  gulp.src(['app.coffee', '**/*.coffee'], {cwd: 'app'})
      .pipe(coffeelint())
      .pipe(coffeelint.reporter())
      .on('error', errorHandler);
});

// compile coffeescript and copy them.
gulp.task('compile', function() {
  return gulp
    .src(['**/*.coffee'], { cwd: 'app' })
    .pipe(coffee({bare: false}))
    .pipe(gulp.dest(targetDir))
    .on('error', errorHandler);
});

// run the develope node server and watch over changes
gulp.task('develop', function() {
  nodemon({
    script: 'server.coffee',
    ext: 'coffee',
    watch: 'app',
    env: {
      'NODE_ENV': 'development',
      'APP_DIR': targetDir
    },
  }).on('change', ['coffeelint', 'compile'])
  .on('restart', function() {
    console.log('restarted');
  });

});

gulp.task('config', function() {
  gulp.src('app/configs/**/*json')
      .pipe(gulp.dest(targetDir + '/configs'))
      .on('error', errorHandler)
});

gulp.task('styles', function() {
  var options = build ?
                { style: 'compressed' } :
                { style: 'expanded' };

  options.loadPath = ['bower_components/normalize.css',
                      'bower_components/foundation/scss',
                      'bower_components/ionicons/scss'];

  var sassStream = plugins.rubySass('app/styles/main.scss', options)
      .pipe(plugins.autoprefixer('last 1 Chrome version', 'last 3 iOS versions', 'last 3 Android versions'))

  return streamqueue({ objectMode: true }, sassStream)
    .pipe(plugins.concat('main.css'))
    .pipe(plugins.if(build, plugins.stripCssComments()))
    .pipe(plugins.if(build, plugins.rev()))
    .pipe(gulp.dest(path.join(targetDir, 'styles')))
    .on('error', errorHandler);
});

gulp.task('fonts', function() {
  return gulp
    .src(['app/styles/fonts/*.*', 'bower_components/ionicons/fonts/*.*'])
    .pipe(gulp.dest(path.join(targetDir, 'fonts')))
    .on('error', errorHandler);
});

gulp.task('images', function () {
  return gulp
    .src('app/images/**/*')
    .pipe(gulp.dest(path.join(targetDir, 'images/')))
    .on('error', errorHandler);
});

gulp.task('favicon', function() {
  return gulp
    .src('app/styles/favicon.ico')
    .pipe(gulp.dest(path.join(targetDir, 'styles')))
    .on('error', errorHandler);
});

gulp.task('views', function() {
  return gulp
    .src('app/views/**/*.jade')
    .pipe(gulp.dest(path.join(targetDir, 'views')))
    .on('error', errorHandler);
});

gulp.task('index', function() {

  // build has a '-versionnumber' suffix
  var cssNaming = build ? 'styles/main-*' : 'styles/main*';

  // get all our javascript sources
  // in development mode, it's better to add each file seperately.
  // it makes debugging easier.
  // var _getAllScriptSources = function() {
  //   var scriptStream = gulp.src(['scripts/app.js', 'scripts/**/*module*.js', 'scripts/**/*.js'], { cwd: targetDir });
  //   return streamqueue({ objectMode: true }, scriptStream);
  // };

  return gulp.src('app/views/home.jade')
    // inject css
    .pipe(plugins.inject(gulp.src(cssNaming, { cwd: targetDir }), {name: 'main'}))
    .pipe(plugins.inject(gulp.src('vendor*.js', { cwd: targetDir }), {name: 'vendor'}))
    // inject app.js (build) or all js files indivually (dev)
    // .pipe(plugins.if(build,
    //   _inject(gulp.src('app*.js', { cwd: targetDir }), 'app'),
    //   _inject(_getAllScriptSources(), 'app')
    // ))

    .pipe(gulp.dest(targetDir + '/views'))
    .on('error', errorHandler);
});

gulp.task('serve', function() {
  express()
    .use(!build ? connectLr() : function(){})
    .use(express.static(targetDir))
    .listen(port);
  open('http://localhost:' + port + '/', 'Google Chrome');
});

// start watchers
gulp.task('watchers', function() {
  plugins.livereload.listen();
  gulp.watch('app/styles/**/*.scss', ['styles', 'index']);
  gulp.watch('app/views/**/*.jade', ['views']);
  gulp.watch('app/styles/fonts/**', ['fonts']);
  // gulp.watch('app/images/**', ['images']);
  // gulp.watch('app/**/*.coffee', ['jsHint', 'scripts', 'index']);
  // gulp.watch('./vendor.json', ['vendor']);
  // gulp.watch('app/templates/**/*.html', ['scripts', 'index']);
  // gulp.watch('app/index.html', ['index']);
  gulp.watch(targetDir + '/**')
    .on('change', plugins.livereload.changed)
    .on('error', errorHandler);
});


gulp.task('noop', function() {});

// our main sequence, with some conditional jobs
gulp.task('default', function(done){
  runSequence(
    'clean',
    [
      'coffeelint',
      'compile',
      'fonts',
      // 'views',
      'styles',
      'favicon',
      'images',
      'config'
    ],
    'index',
    release ? 'noop' : 'watchers',
    release ? 'noop' : 'develop',
    done);
});