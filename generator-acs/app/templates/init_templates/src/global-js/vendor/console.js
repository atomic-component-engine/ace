/**
 * @file Defines an empty function for console.log etc so that IE8 doesn't trip up during develpoment
 */

define([
], function () {

	return{
		run: function () {
			if (typeof console == 'undefined' || !console) {
				window.console = {
					log: function (str) {},
					warn: function (str) {},
					error: function (str) {}
				}
			}
		}
	}	

});
