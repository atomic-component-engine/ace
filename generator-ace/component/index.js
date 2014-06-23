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

		// Convert CLI args to array
		var args = [];
		for (var k in arguments) {
 			args.push(arguments[k]);
		}

		// Process CLI args if given
		if (typeof componentType != 'undefined') this.componentType = componentType;
		if (typeof componentName != 'undefined') this.componentName = componentName;
		if (args.indexOf('nosass') > 1) this.createSASS = false;
		if (args.indexOf('nojs') > 1) this.createJS = false;

		/**
		 * {Boolean}
		 * Whether or not to show user prompts
		 */
		this.interactive = (!this.componentType || !this.componentName);

		/**
		 * {ProjectHelper}
		 */
		this.project = new ProjectHelper();

		/**
		 * {Object}
		 * Defines templates for component file paths
		 */
		this.pathTemplates = {
			componentJadeFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.jade',
			componentJadeDemoFile:  'src/<%= type %>s/_<%= id %>/_demo_<%= id %>.jade',
			componentJSFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.js',
			componentSASSFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.scss',
			componentSASSDemoFile: 'src/<%= type %>s/_<%= id %>/_demo_<%= id %>.scss'
		};

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
		if (this.interactive) {
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

	/**
	 * Analyses user's response to the various prompts and sets up any variables or content
	 */
	setup: function () {

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
		this.componentId = this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

		/**
		 * {object}
		 * Target dirs for Jade, SASS and JS files
		 */
		this.paths = _.object(_.map(this.pathTemplates, function (pathTpl, pathKey) {
			var path = _.template(pathTpl, {
				type: this.componentType,
				id: this.componentId
			});
			return [pathKey, path];
		}.bind(this)));

		/**
		 * {Boolean}
		 * Whether or not to generate a SASS module for the component
		 */
		if (typeof this.createSASS == 'undefined') this.createSASS = !this.interactive || this.componentAssets.indexOf('sass') != -1;

		/**
		 * {Boolean}
		 * Whether or not to generate a JavaScript module for the component
		 */
		if (typeof this.createJS == 'undefined') this.createJS = !this.interactive || this.componentAssets.indexOf('js') != -1;

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
		if (this.createSASS) {
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
		if (this.createJS) {
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

