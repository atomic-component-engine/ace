/**
 * @file Provides a class which will resolve dependencies for an ACE component
 * @author Tom Jenkins tom@itsravenous.com
 */

var fs = require('fs');

/**
 * {Constructor}
 */
var dependencyResolver = function (options) {
	this.options = options;
}

/**
 * {Prototype}
 */
dependencyResolver.prototype = {

	/**
	 * Finds the jade dependencies for a component
	 * @return {Array}
	 */ 
	getJadeDeps: function () {
		var deps = [];

		var chosenExportFilePath = 'src/' + this.options.type + "s/" + this.options.name + "/" + this.options.name + ".jade";
		var data = fs.readFileSync(chosenExportFilePath, "utf8");
		var checkInclude =  /\n[\s]*include\s(.+)/g;
		while(match = checkInclude.exec(data)){
			var matchRelativePath = match[1].replace(/\.{1,2}\//g, "");
			var splitBySlash = matchRelativePath.split("/");
			splitBySlash.pop();
			console.log(splitBySlash.join("/"));
			deps.push(splitBySlash.join("/"));
		};

		return deps;
	}

}

module.exports = dependencyResolver;