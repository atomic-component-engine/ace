/**
 * @file Helper class for various project operations
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');

/**
 * {Constructor}
 */
var ProjectHelper = function (options) {
	this.root = process.cwd() + '/';
	this.srcDir = this.root + '/src';
	this.jsDir = this.root + '/src/global-js';
	this.sassDir = this.root + '/src/global-scss';
	this.exporDir = this.root + '/src/global-scss';

	var rConfig = this.jsDir + '/main.js';
	this.requireConfig = fs.exists(rConfig) ? require(rConfig) : {};
}

ProjectHelper.prototype = {



}

module.exports = ProjectHelper;