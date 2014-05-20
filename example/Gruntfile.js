module.exports = function(grunt) {

	///////////////////////////////////////////////////////////////////////////////
	// ENVIRONMENT SETUP
	///////////////////////////////////////////////////////////////////////////////
	// Define variables per environment
	var buildConfig = {
		dev: {
			dest: 'dev',
			jsTasks: ['jshint', 'copy:js'],
			sassOutputStyle: 'expanded'
		},
		release: {
			dest: 'release',
			jsTasks: ['jshint', 'requirejs'],
			sassOutputStyle: 'compressed'
		}
	};

	// Get requested environment
	var buildType = process.argv[2];

	var env;
	if (buildType !== 'dev' && buildType !== 'release') {
		// No environment specified, use dev
		buildType = 'dev';
	}
	env = buildConfig[buildType];
	
	///////////////////////////////////////////////////////////////////////////////
	// DEPENDENCIES & TASK SETUP
	///////////////////////////////////////////////////////////////////////////////
	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
	};

	// JS linting
	gruntConfig.jshint = {
		files: ['gruntfile.js', 'src/**/**/*.js'],
		options: {
			globals: {
				jQuery: true,
				console: true,
				module: true,
				document: true
			},
			ignores: [
				'src/global-js/r.js',
				'src/global-js/vendor/**/*.js',
				'src/global-js/ie/*.js'
			]
		}
	};

	// RequireJS
	gruntConfig.requirejs = {
		compile: {
			options: {
				mainConfigFile: "src/global-js/main.js",
				out: env.dest+'/js/<%= pkg.name %>.min.js'
			}
		}
	};
	// Jade => HTML
	gruntConfig.jade = {
		compile: {
			options: {
				pretty: true,
				data: {
					env: buildType,
					pkg: {
						name: '<%= pkg.name %>'
					},
					aceConfig: grunt.file.readJSON('ace_config.json'),
				}
			},
			files:  [
				{
					expand: true,
					cwd: 'src/',
					dest: env.dest,
					src: ['**/**/*.jade', '!pages/**/*.jade'],
					ext: '.html'
				},
				{
					expand: true,
					flatten: true,
					cwd: 'src/pages/',
					dest: env.dest+"/pages/",
					src: ['**/*.jade'],
					ext: '.html'
				}
			],
		}
	};

	// SASS => CSS
	gruntConfig.compass = {
		dist: {
			options: {
				require: [
					'sass-globbing'
				],
				imagesDir: 'src/img',
				sassDir: 'src/global-scss/',
				cssDir: env.dest+'/css',
				outputStyle: env.sassOutputStyle,
				relativeAssets: false
			}
		}
	};

	// Replace REM with px
	gruntConfig.remfallback= {
		options: {
			log: false,
			replace: false
		},
		your_target: {
			files: {}
		}
	};
	gruntConfig.remfallback.your_target.files[env.dest+'/css/main.css'] = [env.dest+'/css/main.css'];


	// Asset copying
	gruntConfig.copy = {
		img: {
			files: [
				{expand: true, cwd: 'src/img', src: ['**'], dest: env.dest+'/img', filter: 'isFile'}
			]
		},
		video: {
			files: [
				{expand: true, cwd: 'src/video', src: ['**'], dest: env.dest+'/video'}
			]					
		},
		js: {
			files: [
				{expand: true, flatten: true, cwd: 'src/atoms', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/molecules', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/organisms', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/templates', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: false, cwd: 'src/global-js', src: ['**/*.js'], dest: env.dest+'/js'}
			]
		}
	};

	// Task watching
	gruntConfig.watch = {
		options: {
			livereload: true
		},
		js: {
			files: ['src/**/**/*.js'],
			tasks: ['js'],
			options: {
				interrupt: true
			}
		},
		scss: {
			files: ['src/**/**/*.scss'],
			tasks: ['sass'],
			options: {
				interrupt: true
			}
		},
		jade: {
			files: ['src/**/**/*.jade'],
			tasks: ['jade'],
			options: {
				interrupt: true
			}
		},
		img: {
			files: ['src/img/**'],
			tasks: ['copy:img'],
			options: {
				interrupt: true
			},
		},
		video: {
			files: ['src/video/**'],
			tasks: ['copy:video'],
			options: {
				interrupt: true
			},
		}
	};

	// Servers
	gruntConfig.connect = {
		dev: {
			options: {
				port: 7000,
				base: 'dev',
				keepalive: true,
				livereload: true
			}
		},
		release: {
			options: {
				port: 8000,
				base: 'release',
				keepalive: true
			}
		}
	};

	// Pass above config to Grunt
	grunt.initConfig(gruntConfig);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-remfallback');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// Set up task aliases
	grunt.registerTask('js', env.jsTasks); // Get JS tasks from environment (e.g. only run concat or uglify in release)
	grunt.registerTask('default', ['jshint', 'jade', 'js', 'copy:img', 'copy:video', 'compass', 'remfallback']);
	
	grunt.registerTask('sass', ['compass', 'remfallback']);

	// Shorthand environment servers
	grunt.registerTask('serve-dev', ['connect:dev']);
	grunt.registerTask('serve-release', ['connect:release']);
	
	// Define dummy tasks to allow  CLI to pass environment
	grunt.registerTask('dev', ['default', 'watch']);
	grunt.registerTask('release', ['default', 'serve-release']);

};
