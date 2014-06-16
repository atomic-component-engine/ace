/**
 * @file Sets up RequireJS config and bootstraps the website
 */

var commonJS = module && typeof requirejs == 'undefined';
var config = {
	
	'paths': {
		'base':				'vendor/Base',
		'jquery':			'vendor/jquery',
		'text':				'vendor/require-text',
		'elementquery':		'vendor/elementQuery',
		'html5shiv':		'ie/html5shiv',
	},
	
	'shim': {
		'jquery': {
			'exports': '$'
		},
		'elementquery': {
			'deps': ['jquery'],
			'exports': 'elementQuery'
		},
		'html5shiv':{
			'exports' : 'h5s'
		}
	},
	
	'name': 'main',
	'wrap': true
	
};


// Loading via require or node?
if (!commonJS) {
	// Require, set up
	requirejs.config(config);

	requirejs([
		'vendor/console',
		'vendor/domReady',
		'jquery',
		'elementquery',
		'html5shiv',
		'componentList'
	],
		
	function (consolePolyfill, domReady, $, eq, h5s, componentList) {
		consolePolyfill.run();
		console.log('[main.js] Website init');

		// init element query
		window.elementQuery.init();

		// refresh element query on window resize
		// NOTE: we use a jQuery plugin for the resize event
		// because it it far less resource intensive.
		$.windowResize(window.elementQuery.refresh);

		domReady(function () {
			// Get the list of components and 
			// run their tasks
			componentList.runComponentTasks();
		});

	});
} else {
	// Node, export config
	module.exports = config;
}