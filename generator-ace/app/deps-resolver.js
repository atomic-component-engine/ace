/**
 * @file Provides a class which will resolve dependencies for an ACE component
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
var madge = require('madge');

/**
 * {Constructor}
 */
var dependencyResolver = function (options) {
	this.options = options;

	// Various file paths for project & component
	this.cwd = process.cwd()
	this.root = 'src/' + this.options.type + 's/' + this.options.name + '/';
	this.configFile = this.root + 'ace.json';
	this.jadeFile = this.root + this.options.name + '.jade';
	this.jsFile = this.root + this.options.name + '.js';
	this.sassFile = this.root + this.options.name + '.scss';
	this.globalJSDir = this.cwd + '/src/global-js/';

	// Get component config
	if (!fs.existsSync(this.configFile)) {
		console.log(chalk.green('create'), 'ace.json');
		this.config = {};
		var buf = new Buffer(JSON.stringify(this.config), 'utf-8');
		fs.writeSync(fs.openSync(this.configFile, 'w'), buf, null, buf.length, null);
	} else {
		this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
	}

	// Get project's requireJS config
	this.projectRequireConfig = require(this.globalJSDir + 'main.js');
}

/**
 * {Prototype}
 */
dependencyResolver.prototype = {

	/**
	 * Finds the dependencies for a component by parsing its various source files
	 * @return {Object}:
	 * 					- components: {Array} list of component dependencies
	 * 					- js: {Array} list of js dependencies
	 * 					- sass: {Array} list of sass dependencies
	 */ 
	getImpliedDeps: function () {
		var compDeps = [];
		var jsDeps = [];
		var sassDeps = [];

		var compDeps = compDeps.concat(this.getImpliedComponentDeps());
		var jsDeps = jsDeps.concat(this.getImpliedJSDeps());
		var sassDeps = sassDeps.concat(this.getImpliedSASSDeps());

		return {
			components: compDeps,
			js: jsDeps,
			sass: sassDeps
		};
	},

	/**
	 * Finds the component dependencies for a component by regexing its jade mixin file
	 * @return {Array}
	 */ 
	getImpliedComponentDeps: function () {
		var deps = [];
		var data = fs.readFileSync(this.jadeFile, "utf8");
		var matchJadeIncludes =  /^[\s]*include\s(.+)\s*$/mg;
		var match;
		while(match = matchJadeIncludes.exec(data)){
			var stripRelativePath = match[1].replace(/\.{1,2}\//g, "");
			var pathParts = stripRelativePath.split("/");
			pathParts.pop();
			deps.push(pathParts.join("/"));
		};

		return deps;
	},

	/**
	 * Finds any non-component js dependencies for the component using madge (http://github.com.pahen.madge)
	 * @return {Array}
	 */
	getImpliedJSDeps: function () {

		// Gather require module dependencies
		var results = madge(this.root, {
			format: 'amd',
		});
		var deps = results.tree[this.options.name];

		// Get filenames for dependencies, using path alias if necessary
		deps = deps.map(function (dep, i) {
			var depFile = dep + '.js';
			if (fs.existsSync(this.globalJSDir + depFile)) {
				return depFile;
			} else {
				return this.projectRequireConfig.paths[dep] ? this.projectRequireConfig.paths[dep] + '.js' : null;
			}
		}.bind(this));

		return deps;
	},

	/**
	 * Finds any non-component sass depenencies (e.g. mixins) for the component by regexing its sass module
	 * [TODO currently only finds mixin dependencies, and assumes they are in the global sass mixins folder. Will not handle e.g. compass includes, or mixins that are placed elsewhere.]
	 * @return {Array}
	 */
	getImpliedSASSDeps: function () {
		var deps = [];
		var data = fs.readFileSync(this.sassFile, 'utf-8');

		// Load in all global mixin files for later scanning
		var mixinDir = this.options.projectSASS + 'mixins/';
		var mixinFiles = fs.readdirSync(mixinDir);
		var mixinData = {};
		for (var k in mixinFiles) {
			mixinData[mixinFiles[k]] = fs.readFileSync(mixinDir+mixinFiles[k], 'utf-8');
		}

		var matchMixins = /^\s*@include\s+([^;]*);?\s*$/mg;
		var match;
		var mixinName;
		var mixinFile;
		var mixinDefPattern;
		while (match = matchMixins.exec(data)) {
			// Get matched mixin name
			mixinName = match[1];
			// Define mixin search pattern
			mixinDefPattern = new RegExp('^\s*@mixin\\s+' + mixinName, ['m']);
			// Loop over mixin files to find one that contains this mixin
			for (var file in mixinData) {
				// Does the file contain the mixin?
				if (mixinDefPattern.test(mixinData[file])) {
					mixinFile = file;
					// Add to dep list
					deps.push(mixinFile);
					break;
				}
			}
		}

		return deps;
	},

	/**
	 * Finds the dependencies for a component that are explicity listed in the ace.json file
	 *  @return {Object}:
	 * 					- components: {Array} list of component dependencies
	 * 					- js: {Array} list of js dependencies
	 * 					- sass: {Array} list of sass dependencies
	 */
	getExplicitDeps: function () {
		
		var compDeps = [];
		var jsDeps = [];
		var sassDeps = [];
		if (this.config.dependencies) {
			compDeps = this.getExplicitComponentDeps();
			jsDeps = this.getExplicitJSDeps();
			sassDeps = this.getExplicitSASSDeps();
		}

		return {
			components: compDeps,
			js: jsDeps,
			sass: sassDeps
		};
	},

	/**
	 * Finds the component dependencies for a component that are explicity listed in the ace.json file
	 * @return {Array}
	 */
	 getExplicitComponentDeps: function () {
	 	var deps = [];

	 	if (this.config.dependencies.components) {
			deps = this.config.dependencies.components;
		}

		return deps;
	},

	/**
	 * Finds the JS dependencies for a component that are explicity listed in the ace.json file
	 * @return {Array}
	 */
	getExplicitJSDeps: function () {
		var deps = [];

		if (this.config.dependencies.js) {
			deps = this.config.dependencies.js;
		}

		return deps;
	},

	/**
	 * Finds the SASS dependencies for a component that are explicity listed in the ace.json file
	 * @return {Array}
	 */
	getExplicitSASSDeps: function () {
		var deps = [];
		if (this.config.dependencies.sass) {
			deps = this.config.dependencies.sass;
		}

		return deps;
	}
}

module.exports = dependencyResolver;