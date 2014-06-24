'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var inquirer = require("inquirer");
var wrench = require("wrench");

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var archiver = require('archiver');
var deleteFolderRecursive = require('../lib/deleteFolderRecursive');

var GetGitInfo = require('../lib/get-git-info');

var DependencyResolver = require('../lib/deps-resolver');
var ProjectHelper = require('../lib/project-helper');
var ComponentHelper = require('../lib/component-helper');

var componentTypes = require('../lib/component-types');

/**
 * {yeoman.generators}
 * {ExportGenerator}
 * Handles exporting a component
 */
var ExportGenerator = yeoman.generators.Base.extend({

	/**
	 * @constructor
	 * Defines init prompts
	 * Parses task name to set various flags
	 * If this isn't a project initialisation, try and read in the ACE config
	 */
	init: function (arg) {

		/**
		 * {ProjectHelper}
		 */
		this.project = new ProjectHelper();

		if(!this.project.inited) {
			console.log(chalk.red('ACE config file (ace_config.json) not found.'), chalk.green('Running ACE init...'));
			this.invoke('ace:init');
			this.async();
			return;
		}

		/**
		 * {Object}
		 * Defines templates for component file paths
		 */
		this.pathTemplates = {
			componentJadeFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.jade',
			componentJadeDemoFile:  'src/<%= type %>s/_<%= id %>/_demo_<%= id %>.jade',
			componentJSFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.js',
			componentSASSFile: 'src/<%= type %>s/_<%= id %>/_<%= id %>.scss',
			componentSASSDemoFile: 'src/<%= type %>s/_<%= id %>/_demo_<%= id %>.scss'
		};

		/**
		 * {Object}
		 * User's git config
		 */
		this.gitConfig = GetGitInfo.getConfig();

	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {
		var done = this.async();
		var self = this;

		var exportPkg = {};
		var componentList = [];
		var jadeDeps = [];

		// Begin the interrogation
		this.prompt([
			{
				type: 'list',
				name: 'exportSelectType',
				message: 'What type would you like to export?',
				choices: this.project.getComponentTypeCountsList()
			},{
				when: function (response) {
					return true;
				},
				type: 'list',
				name: 'componentSelect',
				message: 'Which component do you want to export?',
				choices: function(response) {
					componentList = self.project.getComponents(response.exportSelectType+'s');
					return componentList;
				},
			},
			{
				type: 'confirm',
				name: 'includeGlobalJSAndSASS',
				message: 'Your component may depend on non-component JS and SASS files. Would you like to export the global JS and SASS folders too?'
			}
		], function (response) {
			// Get type and name of component so we can find it
			this.exportComponent = {
				type: response.exportSelectType.toLowerCase(),
				name: response.componentSelect
			}

			this.exportGlobalFolders = response.includeGlobalJSAndSASS;

			done();
		}.bind(this));

	},

	/**
	 * Builds file paths for the component
	 */
	buildDirs: function () {
		/**
		 * {object}
		 * Target dirs for Jade, SASS and JS files
		 */
		this.paths = _.object(_.map(this.pathTemplates, function (pathTpl, pathKey) {
			var path = _.template(pathTpl, {
				type: this.exportComponent.type,
				id: this.exportComponent.name
			});
			return [pathKey, path];
		}.bind(this)));
	},

	/**
	 * Finds dependencies for the selected component
	 */
	getDeps: function () {
		/**
		 * {ComponentHelper}
		 */
		this.componentHelper = new ComponentHelper({
			type: this.exportComponent.type,
			name: this.exportComponent.name,
		});
		/**
		 * {DependencyResolver}
		 */
		var depRes = new DependencyResolver(this.project, this.componentHelper);

		// Get explicit (config-defined) dependencies
		var explicitDeps = depRes.getExplicitDepsRecursive();
		console.log('explicitDeps', explicitDeps);
		this.compDeps = explicitDeps.components;
		this.jsDeps = explicitDeps.js;
		this.sassDeps = explicitDeps.sass;
	},

	/**
	 * Copies the files of the component and its dependencies to the export folder
	 */
	export: function () {		

		/// Build component folder path
		this.fileToExport = this.exportComponent.type + "s/" + this.exportComponent.name;

		// Copy component to export folder
		this.directory(this.project.srcDir+'/'+this.fileToExport, this.project.exportDir+'/'+this.fileToExport);

		this.exportedFiles = [];
		this.exportedFiles.push(this.fileToExport + "/**");

		// Copy dependency components to export folder
		this.compDeps.forEach(function (component) {
			this.directory(this.project.srcDir+'/'+component, this.project.exportDir+'/'+component);
			this.exportedFiles.push(component + "/**");
		}.bind(this));

		// Copy non-component (global) dependencies
		if (this.exportGlobalFolders) {
			// Copy all
			this.directory(this.project.sassDir, this.project.exportDir+'/global-scss');
			this.directory(this.project.jsDir, this.project.exportDir+'/global-js');
			this.exportedFiles.push('global-scss/**');
			this.exportedFiles.push('global-js/**');
		} else {
			// Copy only explicitly requested
			this.sassDeps.forEach(function (sassDep) {
				var stats = fs.statSync(this.project.sassDir + "/" + sassDep)
				if(stats.isDirectory()){
					this.directory(this.project.sassDir+'/'+sassDep, this.project.exportDir+'/global-scss/'+sassDep);
					this.exportedFiles.push('global-scss/'+sassDep+"/**");
				}else{
					this.copy(this.project.sassDir+'/'+sassDep, this.project.exportDir+'/global-scss/'+sassDep);
					this.exportedFiles.push('global-scss/'+sassDep+"**");
				}

			}.bind(this));

			this.jsDeps.forEach(function (jsDep) {
				if (jsDep.indexOf('.js') != jsDep.length - 4) jsDep = jsDep + '.js';
				this.copy(this.project.jsDir+'/'+jsDep, this.project.exportDir+'/global-js/'+jsDep)
				this.exportedFiles.push('global-js/'+jsDep);
			}.bind(this));
		}
	},

	/**
	 * Zips up the exported files
	 */
	archive: function () {

		// Create 
		this.archiveStream = fs.createWriteStream(this.project.exportDir + '/' + this.exportComponent.name + '.zip');
		var archive = archiver('zip');

		archive.on('error', function(err){
			throw err;
		});

		archive.pipe(this.archiveStream);

		archive.bulk([
			{
				expand: true,
				cwd: 'src',
				src: this.exportedFiles,
				dest: 'export'
			}
		]);
		archive.finalize();
	},

	/**
	 * Removes exported files once they've been archived
	 */
	cleanup: function () {
		this.archiveStream.on('close', function () {
			for(var i = 0; i < this.exportedFiles.length; i++) {
				var exportedFilePath = this.exportedFiles[i].split("/");
				exportedFilePath.pop();
				exportedFilePath = exportedFilePath.join();
				exportedFilePath = exportedFilePath.replace(",", "/");
				deleteFolderRecursive("export/" + exportedFilePath);
			};
			// Remove empty dirs
			var emptyDirs = [
				'global-scss',
				'global-js',
				'atoms',
				'molecules',
				'organisms',
			];
			emptyDirs.forEach(function(emptyDir) {
				if (fs.existsSync(this.project.exportDir+emptyDir)) fs.rmdirSync(this.project.exportDir+'/'+emptyDir);
			}.bind(this));

			console.log(chalk.green("Export complete"));
		}.bind(this));
	}
});

module.exports = ExportGenerator;