'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		uglify: {
			dist: {
				src: './app/assets/js/papers.js',
				dest: './app/assets/js/papers.min.js'
			}
		},
		cssmin: {
			options: {
				report: 'gzip'
			},
			compress: {
				files: {
					'./app/assets/css/styles.min.css': [
						'./app/assets/css/base.css',
						'./app/assets/css/base.css'
					]
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	// Default task
	grunt.registerTask('build', ['cssmin', 'uglify']);
	grunt.registerTask('default', ['build']);

};
