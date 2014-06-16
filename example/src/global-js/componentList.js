/**
 * @file Defines behaviours for a page_default module
 */

define([
	'jquery',
	'componentTasks',
	'text!componentList.json'
], function ($, componentTasks, componentListjson) {

	var ComponentList = function () {
		var self = this;
		this.components = JSON.parse(componentListjson);
	};

	ComponentList.prototype = {
		components: [],

		runComponentTasks: function(){

			require(this.components, function(){
				console.log('components modules loaded as:', arguments);
				// Loop over selectors,  detecting components and running necessary tasks
				for (var selector in componentTasks.taskList) {
					var $components = $(selector);

					if ($components.length) {
						// Run component task
						componentTasks.getTask(selector).apply(this, [$components]);
					}
				}
			});

		}
	};

	return new ComponentList();
});
