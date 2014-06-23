'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var getGitInfo = require('../lib/get-git-info');

var DependencyResolver = require('../lib/deps-resolver');
var ProjectHelper = require('../lib/project-helper');
var ComponentHelper = require('../lib/component-helper');
var questions = require('../lib/common-questions');


/**
 * {yeoman.generators}
 * {ComponentsGenerator}
 * Handles component generation
 */
 var ComponentsGenerator = yeoman.generators.Base.extend({

	/**
	 * @constructor
	 * Defines init prompts
	 * Parses task name to set various flags
	 * If this isn't a project initialisation, try and read in the ACE config
	 */
	init: function (componentType, componentName) {

		// Process CLI args if given
		if (typeof componentType != 'undefined') this.componentType = componentType;
		if (typeof componentName != 'undefined') this.componentName = componentName;

		/**
		 * {ProjectHelper}
		 */
		 this.project = new ProjectHelper();

		// Read in ace config if generating page or component
		var aceConfig = "ace_config.json";
		this.aceInitFile = false;

		if(!this.project.inited) {
			try {
				this.aceInitFile = this.readFileAsString(aceConfig);
				this.aceInitFileJSON = JSON.parse(this.aceInitFile);
				this.isInit = true;
				this.identifiedComponents = this.aceInitFileJSON.identifiedComponents;
				this.name = this.aceInitFileJSON.name;
				this.email = this.aceInitFileJSON.email;
			} catch (e) {
				console.log(chalk.red('ace_config.json not found. Try running yo ace:init first.'));
			}
		}

		// Get git config
		var gitConfig = getGitInfo.getConfig();
		if (gitConfig) {
			this.name = gitConfig.user.name;
			this.email = gitConfig.user.email;
		} else {
			console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
		};

	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {

		// Ask the questions (if user hasn't supplied answers via CLI already)
		if (!this.componentType || !this.componentName) {
			var done = this.async();
			
			var prompts = [
				questions.componentType,
				questions.componentName,
				{
					type: 'checkbox',
					name: 'componentAssets',
					message: 'Which assets would you like to generate for the component?',
					choices: [
						{
							name: 'Javascript module',
							value: 'js',
							checked: false
						},
						{
							name: 'SASS module',
							value: 'sass',
							checked: true
						}
					]
				},
			];
			this.prompt(prompts, function (props) {
				this.componentType = props.componentType;
				this.componentName = props.componentName;
				this.componentAssets = props.componentAssets;
				done();
			}.bind(this));
		}
	},

	setupDirs: function () {

		// Check we have all necessary data
		if(!this.componentType) {
			console.log(chalk.red('No component type selected. This shouldn\'t be possible and suggests a problem with the generator. You might want to try re-installing it.'));
			process.exit(1)
		}

		if(!this.componentName) {
			console.log(chalk.red('No component name entered. This shouldn\'t be possible and suggests a problem with the generator. You might want to try re-installing it.'));
			process.exit(1)
		}

		/**
		 * {string}
		 * Component name converted to suitable ID
		 */
		this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

		/**
		 * {object}
		 * Target dirs for Jade, SASS and JS files
		 */
		this.paths = {
			// this is where we define our jade and jade demo paths
			componentJadeFile: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.jade',
			componentJadeDemoFile:  "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.jade',

			// this is where we define our js path
			componentJSFile: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.js',

			// this is where we define our sass and sass demo paths
			componentSASSFile: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.scss',
			componentSASSDemoFile: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.scss'
		};
	},

	/**
	 * Generates Jade files from the user's responses
	 */
	generateJade: function () {		
		
		if(this.componentType == 'template') {
			// Generating a page template
			this.template('_template.jade', this.paths.componentJadeFile);
		} else {
			// Generating a component template
			this.template('_.jade', this.paths.componentJadeFile);
			this.template('_demo.jade', this.paths.componentJadeDemoFile);
		}

	},

	/**
	 * Generates SASS files (if requested) from the user's responses
	 */
	generateSASS: function () {
		if (this.componentAssets.indexOf('sass') != -1) {
			if(this.componentType == 'template') {
				// Generating a page template
				this.template('_.scss', this.paths.componentSASSFile);
			} else {
				// Generating a component template
				this.template('_.scss', this.paths.componentSASSFile);
				this.template('_demo.scss', this.paths.componentSASSDemoFile);
			}
		}
	},

	/**
	 * Generates JS files (if requested) from the user's responses
	 */
	generateJS: function () {
		if (this.componentAssets.indexOf('js') != -1) {
			if(this.componentType == 'template') {
				// Generating a page template
				this.template('_.js', this.paths.componentJSFile);
			} else {
				// Generating a component template
				this.template('_.js', this.paths.componentJSFile);
			}
		}
	},

});

module.exports = ComponentsGenerator;

