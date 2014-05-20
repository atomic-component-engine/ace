/**
 * @file Defines behaviours for a nav_items module
 * @author Phil Hauser phil.hsr@gmail.com
 */

define([
	'jquery',
	'offcanvasMenu',
	'componentTasks',
	'jquery-hammer'
], function ($, offcanvasMenu, componentTasks, jQHammer) {

	navTask = function(){
		var ocM = new offcanvasMenu('header nav .menu');
		$(ocM.$clickEventSelector).hammer().on('tap', function(event){
			ocM.toggle();
		});
	};

	componentTasks.registerTask({
		selector: '.menu',
		task: navTask
	});

	return {}; // Replace this return value with whatever class/function definition you wish this module to make available

});
