/**
 * @file Helper class for various component operations
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
var ProjectHelper = require('./project-helper');

/**
 * {Constructor}
 */
var ComponentHelper = function (options) {
	this.options = options;
	this.name = options.name;
	this.type = options.type;

	this.project = new ProjectHelper();

	// Various file paths for project & component
	this.root = this.project.root + 'src/' + this.options.type + 's/' + this.options.name + '/';
	this.configFile = this.root + 'ace.json';
	this.jadeFile = this.root + this.options.name + '.jade';
	this.jsFile = this.root + this.options.name + '.js';
	this.sassFile = this.root + this.options.name + '.scss';

	// Get component config
	if (!fs.existsSync(this.configFile)) {
		console.log(chalk.green('create'), 'ace.json');
		this.config = {};
		var buf = new Buffer(JSON.stringify(this.config), 'utf-8');
		fs.writeSync(fs.openSync(this.configFile, 'w'), buf, null, buf.length, null);
	} else {
		this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
	}
}

/**
 * {Prototype}
 */

 module.exports = ComponentHelper;