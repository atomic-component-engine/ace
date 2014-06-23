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
	this.exportDir = this.root + '/export';

	// Get requireJS config file
	var rConfig = this.jsDir + '/main.js';
	this.requireConfig = fs.exists(rConfig) ? require(rConfig) : {};

	// Get ACE config
	this.loadConfig();
	
}

ProjectHelper.prototype = {

	loadConfig: function () {
		var configFile = "ace_config.json";
		if (fs.existsSync(configFile)) {
			var config = fs.readFileSync(configFile).toString();
			if (config.length) {
				this.config = JSON.parse(config);
				this.inited = true;
			}
		} else {
			this.inited = false;
		}
	}

}

module.exports = ProjectHelper;