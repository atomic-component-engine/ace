/**
 * @file Defines behaviours for a page_default module
 */

define([
	'jquery'
], function ($) {

	var ComponentTasks = function () {
		var self = this;
	};

	ComponentTasks.prototype = {

		taskList: {},

		registerTask: function(componentTask){
			this.taskList[componentTask.selector] = componentTask.task;
		},

		getTask: function(selector){
			var task = this.taskList[selector];
			return task;
		}

	};

	return new ComponentTasks();
});
