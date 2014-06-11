/**
 * @file Provides a class which will resolve dependencies for an ACE component
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
var madge = require('madge');
var ComponentHelper = require('./component-helper');

/**
 * {Constructor}
 */
var DependencyResolver = function (project, component) {
	this.project = project;
	this.component = component;
}

/**
 * {Prototype}
 */
DependencyResolver.prototype = {

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
		var data = fs.readFileSync(this.component.jadeFile, "utf8");
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
		var results = madge(this.component.root, {
			format: 'amd',
		});
		var deps = results.tree[this.component.name];

		// Get filenames for dependencies, using path alias if necessary
		deps = deps.map(function (dep, i) {
			var depFile = dep + '.js';
			if (fs.existsSync(this.project.jsDir + depFile)) {
				return depFile;
			} else {
				return this.project.requireConfig.paths[dep] ? this.project.requireConfig.paths[dep] + '.js' : null;
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
		var data = fs.readFileSync(this.component.sassFile, 'utf-8');

		// Load in all global mixin files for later scanning
		var mixinDir = this.project.sassDir + 'mixins/';
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

	getExplicitDepsRecursive: function (component) {
		if (typeof component == 'undefined') component = this.component;

		// Get immediate dependencies
		var deps = this.getExplicitDeps(component);

		// Clone deps object so we don't mutate it in the loop
		var rDeps = JSON.parse(JSON.stringify(deps));

		// Recurse into component dependencies
		deps.components.forEach(function (dep, i) {
			var depParts = dep.split('/');
			var type = depParts[0].substr(0, depParts[0].length - 1);
			var name = depParts[1];
			var depHelper = new ComponentHelper({
				type: type,
				name: name
			});
			var depDeps = this.getExplicitDepsRecursive(depHelper);
			rDeps.components = rDeps.components.concat(depDeps.components);
			rDeps.js = rDeps.js.concat(depDeps.js);
			rDeps.sass = rDeps.sass.concat(depDeps.sass);

			// Add extensions to JS files
			rDeps.js = rDeps.js.map(function (dep) {
				return dep.substr(-3) == '.js' ? dep : dep + '.js';
			});

			// Add extensions to SASS files
			rDeps.sass = rDeps.sass.map(function (dep) {
				return dep.substr(-5) == '.scss' ? dep : dep + '.scss';
			});
		}.bind(this));

		return rDeps;
	},

	/**
	 * Finds the dependencies for a component that are explicity listed in the ace.json file
	 *  @return {Object}:
	 * 					- components: {Array} list of component dependencies
	 * 					- js: {Array} list of js dependencies
	 * 					- sass: {Array} list of sass dependencies
	 */
	getExplicitDeps: function (component) {
		if (typeof component == 'undefined') component = this.component;
		
		var compDeps = [];
		var jsDeps = [];
		var sassDeps = [];
		if (component.config.dependencies) {
			compDeps = this.getExplicitComponentDeps(component);
			jsDeps = this.getExplicitJSDeps(component);
			sassDeps = this.getExplicitSASSDeps(component);
		}

		return {
			components: compDeps,
			js: jsDeps,
			sass: sassDeps
		};
	},

	/**
	 * Finds the component dependencies for a component that are explicity listed in its ace.json file
	 * @return {Array}
	 */
	 getExplicitComponentDeps: function (component) {
	 	if (typeof component == 'undefined') component = this.component;

	 	var deps = [];

	 	if (component.config.dependencies && component.config.dependencies.components) {
			deps = component.config.dependencies.components;
		}

		return deps;
	},

	/**
	 * Finds the JS dependencies for a component that are explicity listed in the ace.json file
	 * @return {Array}
	 */
	getExplicitJSDeps: function (component) {
		if (typeof component == 'undefined') component = this.component;

		var deps = [];

	 	if (component.config.dependencies && component.config.dependencies.js) {
			deps = component.config.dependencies.js;
		}

		return deps;
	},

	/**
	 * Finds the SASS dependencies for a component that are explicity listed in the ace.json file
	 * @return {Array}
	 */
	getExplicitSASSDeps: function () {
		if (typeof component == 'undefined') component = this.component;

		var deps = [];
		if (this.component.config.dependencies.sass) {
			deps = this.component.config.dependencies.sass;
		}

		return deps;
	}
}

module.exports = DependencyResolver;