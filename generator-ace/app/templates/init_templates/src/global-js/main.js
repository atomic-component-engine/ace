/**
 * @file Sets up RequireJS config and bootstraps the website
 */

requirejs.config({
	
	'paths': {
		'base':				'vendor/Base',
		'jquery':			'vendor/jquery',
		'text':				'vendor/require-text',
		'templates':		'../templates',
		'elementquery':		'vendor/elementQuery',
		'modernizr':		'vendor/modernizr/modernizr',
		'modernizrpolys':	'vendor/modernizr/modernizrpolys',
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
		'modernizr': {
			'exports': 'Modernizr'
		},
		'modernizrpolys': {
			'deps': ['modernizr'],
		},
		'html5shiv':{
			'exports' : 'h5s'
		}
	},
	
	'name': 'main',
	'include': 'vendor/almond',
	'wrap': true
	
});


requirejs([
	'vendor/console',
	'jquery',
	'elementquery',
	'modernizr',
	'html5shiv'
],
	
function (consolePolyfill, $, eq) {
	consolePolyfill.run();
	console.log('[main.js] Website init');


	// Get body element
	var $body = $(document.body);
	var $html = $body.parent();

	/**
	 * {object}
	 * Defines global tasks; each of these will always run regardless of page
	 */
	var globalTasks = {

	};

	/**
	 * {object} 
	 * Defines tasks to run for specific components. Keyed by component classname by default
	 * Tasks will only be run if their selector is listed in the componentSelectors array (see below)
	 */
	var componentTasks = {
		/**
		 * Add objects whose key is the $ selector for the compoenent
		 * and the function is the component specific JS
		 * 
		 *	'component-selector': function () {
		 *
		 *		// component js
		 *
		 *	}
		 *
		 */
	};


	// init element query
	window.elementQuery.init();

	// refresh element query on window resize
	// NOTE: we use a jQuery plugin for the resize event
	// because it it far less resource intensive.
	$.windowResize(window.elementQuery.refresh);


	// Detect components and run behaviours
	/**
	 * {array}
	 * List of component selectors
	 */
	var componentSelectors = [
		// 'compoenent-selector',
	];
	// Loop over selectors,  detecting components and running necessary tasks
	for (var k in componentSelectors) {
		var selector = componentSelectors[k];
		var $components = $(selector);

		if ($components.length) {
			// Run component task
			componentTasks[selector].apply(this, [$components]);
		}
	}


});


