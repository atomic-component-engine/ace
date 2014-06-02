/**
 * @file Provides a class which will resolve dependencies for an ACE component
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');

/**
 * {Constructor}
 */
var dependencyResolver = function (options) {
	this.options = options;

	// Various file paths for component
	this.root = 'src/' + this.options.type + "s/" + this.options.name + "/";
	this.configFile = this.root + 'ace.json';
	this.jadeFile = this.root + this.options.name + ".jade";

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
dependencyResolver.prototype = {

	/**
	 * Finds the jade dependencies for a component by regexing the mixin file
	 * @return {Array}
	 */ 
	getImpliedDeps: function () {
		var deps = [];

		var data = fs.readFileSync(this.jadeFile, "utf8");
		var checkInclude =  /\n[\s]*include\s(.+)/g;
		while(match = checkInclude.exec(data)){
			var stripRelativePath = match[1].replace(/\.{1,2}\//g, "");
			var pathParts = stripRelativePath.split("/");
			pathParts.pop();
			deps.push(pathParts.join("/"));
		};

		return deps;
	},

	/**
	 * Finds the component dependencies for a component that are explicity listed in the ace.json file
	 */
	getExplicitDeps: function () {
		
		if (this.config.dependencies && this.config.dependencies.components) {
			var deps = this.config.dependencies.components;	
		} else {
			var deps = [];
		};

		return deps;
	}

}

module.exports = dependencyResolver;