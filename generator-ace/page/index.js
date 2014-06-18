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

var GetGitInfo = require('../lib/get-git-info');

var DependencyResolver = require('../lib/deps-resolver');
var ProjectHelper = require('../lib/project-helper');
var ComponentHelper = require('../lib/component-helper');

var componentTypes = require('../lib/component-types');
var questions = require('../lib/common-questions');

/**
 * {yeoman.generators}
 * {PageGenerator}
 * Handles exporting a component
 */
var PageGenerator = yeoman.generators.Base.extend({

	/**
	 * @constructor
	 * Defines init prompts
	 * Parses task name to set various flags
	 * If this isn't a project initialisation, try and read in the ACE config
	 */
	init: function (arg) {

		/**
		 * {ProjectHelper}
		 */
		this.project = new ProjectHelper();

		/**
		 * {Object}
		 * User's git config
		 */
		this.gitConfig = GetGitInfo.getConfig();

		// Load required project variables to be used in templates
		if (this.project.config) {
			this.name = this.project.config.name;
			this.email = this.project.config.email;
			this.identifiedComponents = this.project.config.identifiedComponents;
		} else {
			console.log(chalk.red('ACE config not found, try running "yo ace init" first'));
			this.quit = true;
		}
	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {
		if (!this.quit) {
			var done = this.async();

			// Grab template files
			var templates = fs.readdirSync("src/templates/");
			// Begin the interrogation
			this.prompt([questions.componentName, {
				when: function (response) {
					return response.componentName;
				},
				type: 'list',
				name: 'templateSelect',
				message: 'Which template do you want to use?',
				choices: templates,
			}], function (response) {
				this.componentType = "page";
				this.componentName = response.componentName;
				this.templateSelect = response.templateSelect;
				this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
				done();
			}.bind(this));
		}
	},

	/**
	 * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
	 */
	app: function () {
		if (!this.quit) {
			this.dirs = {
				// this is where we define our jade and jade demo paths
				jadeModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.jade',
				jadePageModDir: "src/" + this.componentType + 's/_' + this.id + '/' + this.id + '.jade',
				jadeDemoDir:  "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.jade',

				// this is where we define our js path
				jsModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.js',

				// this is where we define our sass and sass demo paths
				sassDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.scss',
				sassDemoDir: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.scss'
			};

			this.template('_page.jade', this.dirs.jadeModDir);
			this.template('_page.js', this.dirs.jsModDir);
			this.template('_page.scss', this.dirs.sassDir);
		}
	}
});

module.exports = PageGenerator;

