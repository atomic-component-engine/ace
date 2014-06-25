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

/**
 * {yeoman.generators}
 * {AddDependencyGenerator}
 * Handles exporting a component
 */
var AddDependencyGenerator = yeoman.generators.Base.extend({

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

		if(!this.project.inited) {
			console.log(chalk.red('ACE config file (ace_config.json) not found.'), chalk.green('Running ACE init...'));
			this.invoke('ace:init');
			this.async();
			return;
		}

		/**
		 * {Object}
		 * User's git config
		 */
		this.gitConfig = GetGitInfo.getConfig();

	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {
		var self = this;
		var done = this.async();

		var componentList = [];
		var sassList = [];
		var jsList = [];

		// Begin the interrogation
		this.prompt([
		{
			type: 'list',
			name: 'selectComponentType',
			message: 'To what type of component do you want to add a dependency?',
			choices: this.project.getComponentTypeCountsList()
		},{
			type: 'list',
			name: 'componentSelect',
			message: 'Select component',
			choices: function(response) {
				componentList = self.project.getComponents(response.selectComponentType+'s');
				return componentList;
			},
		},{
			type: 'list',
			name: 'dependencyType',
			message: 'What type of dependency do you want to add?',
			choices: ["Component", "SASS", "JS"]
		},{
			when: function (response) {
				return response.dependencyType == "Component";
			},
			type: 'list',
			name: 'selectDependencyComponentType',
			message: 'Select dependency to add',
			choices: this.project.getComponentTypeCountsList()
		},{
			when: function (response) {
				return response.dependencyType == "Component";
			},
			type: 'list',
			name: 'depComponentSelect',
			message: 'Select component',
			choices: function(response){
				if(response.selectDependencyComponentType){
					componentList = self.project.getComponents(response.selectDependencyComponentType+'s');
				};
				return componentList;
			},
		},{
			when: function (response) {
				return response.dependencyType == "SASS";
			},
			type: 'list',
			name: 'selectDependencySASSDir',
			message: 'Select SASS dependency to add',
			choices: function(response){
				sassList = wrench.readdirSyncRecursive("src/global-scss");
				sassList.unshift(new inquirer.Separator(chalk.red("-------------------")));

				return sassList;

			},
		},{
			when: function (response) {
				return response.dependencyType == "JS";
			},
			type: 'list',
			name: 'selectDependencyJSDir',
			message: 'Select JS dependency to add',
			choices: function(response){
				jsList = wrench.readdirSyncRecursive("src/global-js");
				jsList.unshift(new inquirer.Separator(chalk.red("-------------------")));
				return jsList;
			},
		}
		], function (response) {
			var configFile = "src/" + response.selectComponentType.toLowerCase() + "s/" + response.componentSelect + "/ace.json";

			this.component = new ComponentHelper({
				type: response.selectComponentType.toLowerCase(),
				name: response.componentSelect
			});

			if (!fs.existsSync(configFile)) {
				this.component.createConfig();
			}

			var config = this.readFileAsString(configFile);

			switch(response.dependencyType) {
				case "Component":
					var dependencyName = response.selectDependencyComponentType.toLowerCase() + "s/" + response.depComponentSelect;
					break;
				case "SASS":
					var dependencyName = response.selectDependencySASSDir;
					break;
				case "JS":
					var dependencyName = response.selectDependencyJSDir;
					break;
				default:
					console.log(chalk.red("Invalid dependency type"));
			}

			this.baseComponentType = response.selectComponentType.toLowerCase();
			this.baseComponentName = response.componentSelect;
			this.baseComponent = this.baseComponentType + "s/" + this.baseComponentName;
			this.dependencyName = dependencyName;
			if (response.dependencyType  == 'Component') {
				this.dependencyType = response.selectDependencyComponentType.toLowerCase();
			} else {
				this.dependencyType = response.dependencyType.toLowerCase();
			}
			done();
		}.bind(this));

	},

	/**
	 * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
	 */
	app: function () {
		this.component.addDependency(this.dependencyType, this.dependencyName);
	}
});

module.exports = AddDependencyGenerator;

