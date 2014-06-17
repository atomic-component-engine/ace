/**
 * @file Helper class for various project operations
 * @author Tom Jenkins tom@itsravenous.com
 */

/**
 * {Constructor}
 */
var ProjectHelper = function (options) {
	this.root = process.cwd() + '/';
	this.srcDir = this.root + '/src'
	this.jsDir = this.root + '/src/global-js';
	this.sassDir = this.root + '/src/global-scss';
	this.exportDir = this.root + '/export';
	this.requireConfig = require(this.jsDir + '/main.js');
}

ProjectHelper.prototype = {



}

module.exports = ProjectHelper;