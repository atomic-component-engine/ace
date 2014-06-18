/**
 * @file Defines behaviours for a <%= componentName %> module
 * @author <%= name %> <%= email %>
 */

define([
	'jquery',
	'componentTasks'
], function ($, componentTasks) {

	/**
	*
	* If your component has a task you will need to
	* set your component's task as a method:
	*
	* componentTaskMethod = function(){
	* };
	*
	*
	* And then pass that with the component selector
	* to the component task module:
	*
	* componentTasks.registerTask({
	*	taskSelector: 'selector',
	*	task: componentTaskMethod()
	* });
	*/
	
	return {};

});
