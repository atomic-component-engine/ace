/**
 * @file Defines behaviours for a page_default module
 */

define([
	'jquery'
], function () {

	var OffCanvasMenu = function (clickEventSelector) {
		var self = this;
		this.$body = $("body");
		this.$nav = $("nav");
		this.$clickEventSelector = $(clickEventSelector);
		this.$nav.find('.menu').addClass('menu-toggle--open');
	};

	OffCanvasMenu.prototype = {
		navActiveClass: "show-offcanvas",


		show: function () {
			this.$body.addClass('nav-active');
			this.$nav.addClass(this.navActiveClass);
			this.$clickEventSelector.removeClass('menu-toggle--close');
			this.$clickEventSelector.addClass('menu-toggle--open');
		},

		hide: function () {
			this.$body.removeClass('nav-active');
			this.$nav.removeClass(this.navActiveClass);
			this.$clickEventSelector.addClass('menu-toggle--close');
			this.$clickEventSelector.removeClass('menu-toggle--open');
		},

		toggle: function () {
			this.$body.toggleClass('nav-active');
			this.$nav.toggleClass(this.navActiveClass);
			this.$clickEventSelector.toggleClass('menu-toggle--close');
			this.$clickEventSelector.toggleClass('menu-toggle--open');
		}


	};

	return OffCanvasMenu;
});
