/**
 * @file Helper class for various project operations
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
var inquirer = require('inquirer');

/**
 * {Constructor}
 */
var ProjectHelper = function (options) {
	this.root = process.cwd() + '/';
	this.srcDir = this.root + '/src';
	this.jsDir = this.root + '/src/global-js';
	this.sassDir = this.root + '/src/global-scss';
	this.exportDir = this.root + '/export';

	this.atomDir = this.srcDir + '/atoms';
	this.moleculeDir = this.srcDir + '/molecules';
	this.organismDir = this.srcDir + '/organisms';
	this.templateDir = this.srcDir + '/templates';

	// Get requireJS config file
	var rConfig = this.jsDir + '/main.js';
	this.requireConfig = fs.exists(rConfig) ? require(rConfig) : {};

	// Get ACE config
	this.loadConfig();
	
}

ProjectHelper.prototype = {

	loadConfig: function () {
		var configFile = "ace_config.json";
		if (fs.existsSync(configFile)) {
			var config = fs.readFileSync(configFile).toString();
			if (config.length) {
				this.config = JSON.parse(config);
				this.inited = true;
			}
		} else {
			this.inited = false;
		}
	},

	/**
	 * Returns a list of components grouped by type
	 * @param {String} optional - limit results to a specific type, e.g. atoms
	 * @return {Object or Array}
	 */
	getComponents: function (type) {
		if (typeof type == 'undefined') type = 'all';

		var components = {};
		if (type == 'all' || type == 'atoms') {
			components.atoms = fs.existsSync(this.atomDir) ? fs.readdirSync(this.atomDir) : [];
		}
		if (type == 'all' || type == 'molecules') {
			components.molecules = fs.existsSync(this.moleculeDir) ? fs.readdirSync(this.moleculeDir) : [];
		}
		if (type == 'all' || type == 'organisms') {
			components.organisms = fs.existsSync(this.organismDir) ? fs.readdirSync(this.organismDir) : [];
		}
		if (type == 'all' || type == 'templates') {
			components.templates = fs.existsSync(this.templateDir) ? fs.readdirSync(this.templateDir) : [];
		}
		return (type == 'all') ? components : components[type]
	},

	/**
	 * Returns an object with component counts for each component type
	 * @return {Object}
	 */
	getComponentTypeCounts: function () {
		var componentList = this.getComponents();
		var componentTypeCounts = {};
		for (var type in componentList) {
			componentTypeCounts[type] = componentList[type].length;
		}

		return componentTypeCounts;
	},

	/**
	 * Returns an InquirerJS-ready list of component type choices with counts
	 * @return {Array}
	 */
	getComponentTypeCountsList: function () {
		var typeCounts = this.getComponentTypeCounts();
		console.log(typeCounts)
		var choices = [];
		for (var type in typeCounts) {
			var count = typeCounts[type];
			var label = type[0].toUpperCase()+type.substr(1) + ' (' + count + ')';
			var choice;
			if (count) {
				choice = {
					name: label,
					value: type.substr(0, type.length - 1)
				}
			} else {
				choice = new inquirer.Separator(chalk.grey(label));
			}
			choices.push(choice);
		}
		return choices;
	}

}

module.exports = ProjectHelper;