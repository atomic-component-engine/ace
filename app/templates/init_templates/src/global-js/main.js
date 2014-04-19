/**
 * @file Sets up RequireJS config and bootstraps the website
 */

requirejs.config({
	'baseUrl': '<%= baseUrl %>js',
	
	'paths': {
		'base':				'vendor/Base',
		'jquery':			'vendor/jquery',
		'text':				'vendor/require-text',
		'templates':		'../templates',
		'elementquery':		'vendor/elementQuery',
		'modernizr':		'vendor/modernizr/modernizr',
		'modernizrpolys':	'vendor/modernizr/modernizrpolys',
	},
	
	'shim': {
		'jquery': {
			'exports': '$'
		},
		'elementquery': {
			'exports': 'elementQuery'
		},
		'modernizr': {
			'exports': 'Modernizr'
		},
		'modernizrpolys': {
			'deps': ['modernizr'],
		}
	},
	
	'name': 'main',
	'include': 'vendor/almond',
	'wrap': true
	
});


require([
	'vendor/console',
	'jquery',
	'elementquery',
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


	// Run elementquery
	eq.init();

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


