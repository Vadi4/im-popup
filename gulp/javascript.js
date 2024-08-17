module.exports = function(){
	$.gulp.task('javascript', function(cb) {
		$.gulp.src(['source/scripts/client.js', 'source/scripts/index.js', 'source/scripts/alerts.js'])
			.pipe($.plumber())
			.pipe($.babel({
				presets: ['@babel/preset-env']
			}))
			.pipe($.uglify({
				mangle: {
					keep_fnames: true
				}
			}))
			.pipe($.rename({
				suffix: '.min'
			}))
			.pipe($.gulp.dest('build/js'))

		$.gulp.src('source/scripts/index.js')
			.pipe($.gulp.dest('plugin/dist/js'))			
		cb();
	});
};
