// import gulp and plugins
const gulp = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');

// build scss to css
const sassTask = (done) => {
  // get the file to convert to css
  gulp.src('./scss/style.scss')
  // convert scss to css
  .pipe(sass().on('error', sass.logError))
  // output the file to hosted folder
  .pipe(gulp.dest('./hosted/'));
  
  // tell gulp we're done by using a callback
  done();
};

// build js with babel
// same basic idea as the above sassTask
const jsTask = (done) => {
  gulp.src(['./client/login/*.js', './client/helper/*.js'])
  .pipe(concat('loginBundle.js')) // gulp-concat is needed to make bundles
  .pipe(babel({
    presets: ['@babel/preset-env', '@babel/preset-react']
  }))
  .pipe(gulp.dest('./hosted'));
  
  gulp.src(['./client/app/*.js', './client/helper/*.js'])
  .pipe(concat('bundle.js'))
  .pipe(babel({
    presets: ['@babel/preset-env', '@babel/preset-react']
  }))
  .pipe(gulp.dest('./hosted'));

  done();
};

// eslint on server code
const lintTask = (done) => {
  gulp.src(['./server/*.js'])
  .pipe(eslint())
  // format makes the output readable
  .pipe(eslint.format())
  // if there is an error, stop the task
  .pipe(eslint.failAfterError())
  
  done();
};

// gulp.parallel has all of the paramter functions run simulatenously
// this is okay because none of them depend on each other
module.exports.build = gulp.parallel(sassTask, jsTask, lintTask);

// create a watch script
const watch = () => {
    console.log("HEY");
    
  // check for changes in style.scss, then run sassTask
  gulp.watch('./scss/style.scss', sassTask);
  
  // check for changhes in js files, then run jsTask
  gulp.watch('./client/*.js', jsTask);
  
  // set up nodemon so it restarts the server on a change on any file (except those already being checked above)
  nodemon({
    script: './server/app.js',
    ignore: ['client/', 'scss/', 'node_modules/'],
    ext: 'js html css'
  });
};


// export the watch script for use in package.json
module.exports.watch = watch;