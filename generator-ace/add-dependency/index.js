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
		var done = this.async();

		var componentList = [];
		var sassList = [];
		var jsList = [];

		// Begin the interrogation
		this.prompt([
		{
			type: 'list',
			name: 'selectComponentType',
			message: 'What type of component do you want to add a dependency to?',
			choices: componentTypes
		},{
			type: 'list',
			name: 'componentSelect',
			message: 'Select component',
			choices: function(response){
				componentList = fs.readdirSync("src/" + response.selectComponentType.toLowerCase() + "s");
				return componentList;
			},
		},{
			type: 'list',
			name: 'dependancyType',
			message: 'What type of dependancy do you want to add?',
			choices: ["Component", "SASS", "JS"]
		},{
			when: function (response) {
				if(response.dependancyType == "Component"){
					return true;
				}else{
					return false;
				}
			},
			type: 'list',
			name: 'selectDependancyComponentType',
			message: 'Select dependancy to add',
			choices: componentTypes
		},{
			when: function (response) {
				if(response.dependancyType == "Component"){
					return true;
				}else{
					return false;
				}
			},
			type: 'list',
			name: 'depComponentSelect',
			message: 'Select component',
			choices: function(response){
				if(response.selectDependancyComponentType){
					componentList = fs.readdirSync("src/" + response.selectDependancyComponentType.toLowerCase() + "s");
				};
				return componentList;
			},
		},{
			when: function (response) {
				if(response.dependancyType == "SASS"){
					return true;
				}else{
					return false;
				}
			},
			type: 'list',
			name: 'selectDependancySASSDir',
			message: 'Select SASS dependancy to add',
			choices: function(response){
					//sassList = fs.readdirSync("src/global-scss");

					sassList = wrench.readdirSyncRecursive("src/global-scss");
					sassList.unshift(new inquirer.Separator(chalk.red("-------------------")));

					return sassList;

			},
		},{
			when: function (response) {
				if(response.dependancyType == "JS"){
					return true;
				}else{
					return false;
				}
			},
			type: 'list',
			name: 'selectDependancyJSDir',
			message: 'Select JS dependancy to add',
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

			switch(response.dependancyType) {
					case "Component":
							var dependancyName = response.selectDependancyComponentType.toLowerCase() + "s/" + response.depComponentSelect;
							break;
					case "SASS":
							var dependancyName = response.selectDependancySASSDir;
							break;
					case "JS":
							var dependancyName = response.selectDependancyJSDir;
							break;
					default:
							console.log(chalk.red("Invalid dependancy type"));
			}

			this.baseComponentType = response.selectComponentType.toLowerCase();
			this.baseComponentName = response.componentSelect;
			this.baseComponent = this.baseComponentType + "s/" + this.baseComponentName;
			this.dependancyName = dependancyName;
			if (response.dependancyType  == 'Component') {
				this.dependancyType = response.selectDependancyComponentType.toLowerCase();
			} else {
				this.dependancyType = response.dependancyType.toLowerCase();
			}
			done();
		}.bind(this));

	},

	/**
	 * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
	 */
	app: function () {

		this.component.addDependency(this.dependancyType, this.dependancyName);
		
	}
});

module.exports = AddDependencyGenerator;

