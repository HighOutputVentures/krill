const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('testapp:start', shell.task([
  'pm2 start test/application/pm2.json',
]));
