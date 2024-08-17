module.exports = function(){
	$.gulp.task('clean', function(cb) {
		return $.del(['build', 'plugin/css', 'plugin/js'], cb);
	});
}