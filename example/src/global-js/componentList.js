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

		runComponentTasks: function(specificSelector){

			require(this.components, function(){

				// unless a speccific selector has been passed as an argument
				if(!specificSelector){
					// Loop over selectors,  detecting components and running necessary tasks
					for (var selector in componentTasks.taskList) {
						var $components = $(selector);
						if ($components.length) {
							// Run component task
							componentTasks.getTask(selector).apply(this, [$components]);
						}
					}
				}else{
					var $component = $(specificSelector);
					if ($component.length) {
						// Run component task
						componentTasks.getTask(specificSelector).apply(this, [$component]);
					}
				}

			});

		}

	};

	return new ComponentList();
});
