/**
 * @file Helper class for various component operations
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
var ProjectHelper = require('./project-helper');
var Base = require('basejs');
var _ = require('lodash');

/**
 * {Constructor}
 */
 var ComponentHelper = Base.extend({
 	constructor: function (options) {
 		this.options = options;
 		this.name = options.name;
 		this.type = options.type;

 		this.project = new ProjectHelper();

		// Various file paths for project & component
		this.root = this.project.root + 'src/' + this.options.type + 's/' + this.options.name + '/';
		this.jadeFile = this.root + this.options.name + '.jade';
		this.jsFile = this.root + this.options.name + '.js';
		this.sassFile = this.root + this.options.name + '.scss';
		this.configFile = this.root + 'ace.json';

		// Get component config
		if (!fs.existsSync(this.configFile)) {
			console.log(chalk.green('create'), 'ace.json');
			this.config = {};
			var buf = new Buffer(JSON.stringify(this.config), 'utf-8');
			fs.writeSync(fs.openSync(this.configFile, 'w'), buf, null, buf.length, null);
		} else {
			this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
		}
		// Merge with defaults
		this.config = _.extend({}, {
			name: '',
			author: '',
			dependencies: {}
		}, this.config);
	},

	createConfig: function(){
		console.log(chalk.red("ace.json doesn't exist... Creating an ace.json file:"));
		var config = {
			"name": this.name,
			"dependencies": {
				"components": [],
				"js": [],
				"sass": []
			}
		};
		var buf = new Buffer(JSON.stringify(config), 'utf-8');
		fs.writeSync(fs.openSync(this.configFile, 'w'), buf, null, buf.length, null);
	},

	getConfig: function(){
		var config = JSON.parse(fs.readFileSync(this.configFile, "utf8"));
		return config;
	},

	addDependency: function(type, name) {

		var alreadyAdded = false;
		var type = type.toLowerCase();
		var dependencyList = this.config.dependencies[type];

		if (typeof dependencyList != 'undefined') {
			for(var i=0;i<dependencyList.length;i++){
				if(dependencyList[i] == name){
					alreadyAdded = true;
				}
			}
		} else {
			this.config.dependencies[type] = [];
		}

		if(!alreadyAdded){
			this.config.dependencies[type].push(name);
		}else{
			console.log(chalk.red("You have already added this dependency"));
		}

		var buf = new Buffer(JSON.stringify(this.config, null, 4), 'utf-8');
		fs.writeSync(fs.openSync(this.configFile, 'w'), buf, null, buf.length, null);

	}
});

module.exports = ComponentHelper;