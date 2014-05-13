/**
 * @file Sets up RequireJS config and bootstraps the website
 */

requirejs.config({
	
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
	
});


requirejs([
	'vendor/console',
	'jquery',
	'elementquery',
	'html5shiv',
	'offcanvasMenu',
	'componentList'
],
	
function (consolePolyfill, $, eq, h5s, offcanvasMenu, componentList) {
	consolePolyfill.run();
	console.log('[main.js] Website init');

	// init element query
	window.elementQuery.init();

	// refresh element query on window resize
	// NOTE: we use a jQuery plugin for the resize event
	// because it it far less resource intensive.
	$.windowResize(window.elementQuery.refresh);

	// Get the list of components and 
	// run their tasks
	componentList.runComponentTasks();


});


