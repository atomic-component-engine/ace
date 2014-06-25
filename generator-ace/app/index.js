'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var inquirer = require("inquirer");
var wrench = require("wrench");

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var archiver = require('archiver');
var deleteFolderRecursive = require('../lib/deleteFolderRecursive');

var getGitInfo = require('../lib/get-git-info');

var DependencyResolver = require('../lib/deps-resolver');
var ProjectHelper = require('../lib/project-helper');
var ComponentHelper = require('../lib/component-helper');

var questions = require('../lib/common-questions')

/**
 * {yeoman.generators}
 * {ComponentsGenerator}
 * Hndles project initialisation
 */
var ComponentsGenerator = yeoman.generators.Base.extend({

	/**
	 * @constructor
	 * Defines init prompts
	 * Parses task name to set various flags
	 * If this isn't a project initialisation, try and read in the ACE config
	 */
	init: function (arg, arg2) {

		/**
		 * {Bool}
		 * Whether or not to display usage message
		 */
		this.aceHelp = arg == 'help';

		/**
		 * {ProjectHelper}
		 */
		this.projectHelper = new ProjectHelper();

		/**
		 * {Array}
		 * Contains prompts presented to user at project generation time
		 */
		this.initPrompts = [
			// Confirm project generation
			{
				name: 'confirmInit',
				type: 'confirm',
				message: 'Do you want to init this directory for ACE?'
			},
			// Ask for a package name to be used in package.json
			{
				when: function (response) {
					if(!response.confirmInit) {
						process.exit();
					}
					return response.confirmInit;
				},
				name: 'pkgName',
				message: 'Sweet! What identifier should we use for your app? (e.g. my-atomic-website)'
			},
			// Ask whether the project will be using Git
			{
				when: function (response) {
					return response.pkgName;
				},
				name: 'isGit',
				type: 'confirm',
				message: 'Are you using Git?'
			},
			// Ask whether the user's name and email should be injected into the comment headers of generated files
			{
				when: function (response) {
					return response.isGit;
				},
				name: 'nameInHeader',
				type: 'confirm',
				message: 'Do you want your name and email to be placed in the header \nof all of the components you create (This is useful in teams \nand ace will read these details from your gitconfig)?'
			}
		];

		this.gitConfig = getGitInfo.getConfig();

		// if gitconfig exists
		if (!this.gitConfig) {
			console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
		}

		this.aceNeedsInit = (typeof arg == 'undefined' || !arg.length || arg == 'init');

		if(fs.existsSync("ace_config.json")) {
			this.aceNeedsInit = false;
			this.invoke("ace:component", {args: [arg, arg2]});
		}


	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {
		var done = this.async();
		var self = this;

		// if you are running the init
		if(this.aceNeedsInit) {

			// Welcome message
			console.log(chalk.green('You\'re using the fantastic Atomic Component Engine'))
			console.log(chalk.green('more info: https://atomic-component-engine.github.io/ace/'));

			// Begin the interrogation
			this.prompt(this.initPrompts, function (response) {

				self.nameInHeader = response.nameInHeader;

				if(self.nameInHeader) {
					// if the config exists and the user wants to add name and email to components
					if(self.gitConfig) {
						self.name = self.gitConfig['user'].name;
						self.email = self.gitConfig['user'].email;
					// if the config doesn't exists and the user wants to add name and email to components
					}else{
						var prompts = [questions.userName, questions.userPassword]
						self.prompt(prompts, function (props) {
							self.name = props.userName;
							self.email = props.userEmail;
						}.bind(this));
					}
				}else{
					self.name = " ";
					self.email = " ";
				}

				self.pkgName = response.pkgName;
				self.isGit = response.isGit;
				done();
			});
		} else if(this.aceHelp) {
			var showHelp = require('./help');
			showHelp();

			process.exit();
		}

	},

	/**
	 * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
	 */
	app: function () {

		if(!this.quit) {
			this.directory('init_templates/src', 'src');
			this.template('init_templates/_ace_config.tmpl.json', 'ace_config.json');
			this.template('init_templates/_ace.sublime-project.tmpl', 'ace.sublime-project');
			this.template('init_templates/package.tmpl.json', 'package.json');
			this.copy('init_templates/Gruntfile.js', 'Gruntfile.js');
			this.copy('init_templates/README.md', 'README.md');
			if(this.isGit) {
				this.copy('init_templates/gitignore', '.gitignore');
			}
		}

	},

});

module.exports = ComponentsGenerator;

