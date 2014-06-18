'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var getGitInfo = require('../lib/get-git-info');

var DependencyResolver = require('../lib/deps-resolver');
var ProjectHelper = require('../lib/project-helper');
var ComponentHelper = require('../lib/component-helper');
var questions = require('../lib/common-questions');


/**
 * {yeoman.generators}
 * {ComponentsGenerator}
 * Handles component generation
 */
 var ComponentsGenerator = yeoman.generators.Base.extend({

	/**
	 * @constructor
	 * Defines init prompts
	 * Parses task name to set various flags
	 * If this isn't a project initialisation, try and read in the ACE config
	 */
	 init: function (arg) {

		// Set all arguments to false
		this.aceNeedsInit = false;
		this.acePage = false;
		this.quit = false;
		this.aceExport = false;
		this.addDep = false;
		this.aceHelp = false;

		/**
		 * {ProjectHelper}
		 */
		 this.project = new ProjectHelper();

		// Read in ace config if generating page or component
		var aceConfig = "ace_config.json";
		this.aceInitFile = false;

		if(!this.aceNeedsInit) {
			try {
				this.aceInitFile = this.readFileAsString(aceConfig);
				this.aceInitFileJSON = JSON.parse(this.aceInitFile);
				this.isInit = true;
				this.identifiedComponents = this.aceInitFileJSON.identifiedComponents;
				this.name = this.aceInitFileJSON.name;
				this.email = this.aceInitFileJSON.email;
			} catch (e) {
				console.log(chalk.red('ace_config.json not found. '), chalk.green('Running yo ace init...'));
				this.aceNeedsInit = true;
			}
		}

		var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
		var config_file = home_dir+'/.gitconfig';
		var gitConfigStr = this.readFileAsString(config_file);

		// if gitconfig exists
		if (gitConfigStr) {
			this.gitGlobalConfigFile = getGitInfo.parseConfig(gitConfigStr);
		}else {
			console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
		};

	},

	/**
	 * Presents user with prompts for the requested task
	 */
	askFor: function () {
	 	var done = this.async();
	 	
		var prompts = [
			questions.componentType,
			questions.componentName
		];
		this.prompt(prompts, function (props) {
			this.componentType = props.componentType;
			this.componentName = props.componentName;
			this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
			done();
		}.bind(this));
	},

	/**
	 * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
	 */
	app: function () {

	 	this.dirs = {
			// this is where we define our jade and jade demo paths
			jadeModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.jade',
			jadePageModDir: "src/" + this.componentType + 's/_' + this.id + '/' + this.id + '.jade',
			jadeDemoDir:  "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.jade',

			// this is where we define our js path
			jsModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.js',

			// this is where we define our sass and sass demo paths
			sassDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.scss',
			sassDemoDir: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.scss'
		};

		// Generating a template or component
		if(this.componentType) {
			// Generating a page template
			if(this.componentType == 'template') {
				this.template('_template.jade', this.dirs.jadeModDir);
				this.template('_.js', this.dirs.jsModDir);
				this.template('_.scss', this.dirs.sassDir);
			}else{
				this.template('_.jade', this.dirs.jadeModDir);
				this.template('_demo.jade', this.dirs.jadeDemoDir);
				this.template('_.scss', this.dirs.sassDir);
				this.template('_demo.scss', this.dirs.sassDemoDir);
				this.template('_.js', this.dirs.jsModDir);
			}
		}

	}
});

module.exports = ComponentsGenerator;

