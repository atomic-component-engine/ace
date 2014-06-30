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
	// ACE Component Task setup
	///////////////////////////////////////////////////////////////////////////////	

	/**
	 * {Array}
	 * List of all files (require modules) representing user's components
	 */
	var jsFiles = grunt.file.expand(["src/atoms/**/*.js", "src/molecules/**/*.js", "src/organisms/**/*.js", "src/templates/**/*.js", "src/pages/**/*.js"]);
	/**
	 * {Array}
	 * List of user components, formatted for use as requireJS dependencies
	 */
	var componentsList = [];
	// Loop over files to create componentList
	for(i=0;i<jsFiles.length;i++){
		var fileName;
		// Depending on environment (dev or release) the dependency paths will be different
		if (buildType == 'dev') {
			// Dev, strip path and .js extension
			var slashSeperatedFile = jsFiles[i].split("/");
			fileName = slashSeperatedFile.pop();
			fileName = fileName.substring(0, fileName.length-3);
		} else if (buildType == 'release') {
			// Release, include corrected path (replace leading src/ with ../) and strip .js extension
			fileName = '../' + jsFiles[i].substring(4, jsFiles[i].length - 3);
		}
		// Add component dependency to list
		componentsList.push(fileName);
	}

	// Write component dependency file for require to read in at runtime (dev) or build time (release)
	if (buildType == 'dev') {
		grunt.file.write("dev/js/componentList.json", JSON.stringify(componentsList));
	} else if (buildType == 'release') {
		grunt.file.write("src/global-js/componentList.json", JSON.stringify(componentsList));
	}



	///////////////////////////////////////////////////////////////////////////////
	// DEPENDENCIES & TASK SETUP
	///////////////////////////////////////////////////////////////////////////////
	var gruntConfig = {
		pkg: grunt.file.readJSON('package.json'),
	};

	// Execute shell commands
	gruntConfig.exec = {
		dev: {
			cmd: function() {
				return 'grunt dev';
			}
		}
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

	// RequireJS build (release only)
	/**
	 * {Array}
	 * List of requireJS modules to pass in to build as explicit dependencies
	 */
	var explicitDependencies;
	explicitDependencies = componentsList.slice(0); // Clone user components array
	explicitDependencies.push('vendor/almond'); // Add almond AMD loader
	gruntConfig.requirejs = {
		compile: {
			options: {
				findNestedDependencies: 'true',
				include: explicitDependencies,
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
					dest: 'dev',
					src: ['**/**/*.jade', '!pages/**/*.jade'],
					ext: '.html'
				},
				{
					expand: true,
					flatten: true,
					cwd: 'src/pages/',
					dest: "dev/pages/",
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
		js: {
			files: [
				{expand: true, flatten: true, cwd: 'src/atoms', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/molecules', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/organisms', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/templates', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: true, cwd: 'src/pages', src: ['**/*.js'], dest: env.dest+'/js'},
				{expand: true, flatten: false, cwd: 'src/global-js', src: ['**/*.js'], dest: env.dest+'/js'}
			]
		},
		release: {
			files: [
				{expand: true, flatten: true, cwd: 'dev', src: ['pages/*.html'], dest: 'release/'},
				{expand: true, flatten: true, cwd: 'dev', src: ['atoms/**/*.html'], dest: 'release/'},
				{expand: true, flatten: true, cwd: 'dev', src: ['molecules/**/*.html'], dest: 'release/'},
				{expand: true, flatten: true, cwd: 'dev', src: ['organisms/**/*.html'], dest: 'release/'},
				{expand: true, flatten: true, cwd: 'dev', src: ['templates/**/*.html'], dest: 'release/'},
				{expand: true, flatten: true, cwd: 'dev', src: ['pages/**/*.html'], dest: 'release/'}
			]
		}
	};

	// Task watching
	gruntConfig.watch = {
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
		}
	};

	// Server
	gruntConfig.connect = {
		dev: {
			options: {
				port: 7000,
				base: 'dev',
				keepalive: true
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
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// Set up task aliases
	grunt.registerTask('js', env.jsTasks); // Get JS tasks from environment (e.g. only run concat or uglify in release)
	grunt.registerTask('default', ['jshint', 'jade', 'js', 'copy:img', 'compass', 'remfallback']);
	grunt.registerTask('default-release', ['jshint', 'jade', 'js', 'copy:img', 'compass', 'remfallback', 'copy:release', 'exec:dev']);
	
	grunt.registerTask('sass', ['compass', 'remfallback']);
	grunt.registerTask('serve-dev', ['connect:dev']);
	grunt.registerTask('serve-release', ['connect:release']);
	
	// Define dummy tasks to allow  CLI to pass environment
	grunt.registerTask('dev', ['default', 'watch']);
	grunt.registerTask('release', ['default-release']);

};




