/**
 * @file Provides a class which will resolve dependencies for an ACE component
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');
var chalk = require('chalk');
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