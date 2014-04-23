'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');


var getGitInfo = require('./get-git-info');

/**
 * {Object}
 * Contains common questions used by the component generator
 */
var questions = {
    componentType: {
      type: 'list',
      name: 'componentType',
      message: 'What type would you like to generate?',
      choices: [
      'Atom',
      'Molecule',
      'Organism',
      'Template'
      ],
      filter: function( val ) { return val.toLowerCase(); }
    },
    componentName: {
      type: 'item',
      name: 'componentName',
      message: 'What would you like to call the component?'
    },
    userName: {
      type: 'item',
      name: 'userName',
      message: 'What is your name?'
    },
    userEmail: {
      type: 'item',
      name: 'userEmail',
      message: 'What is your email address?'
    }
}

/**
 * {yeoman.generators}
 * {ComponentsGenerator}
 * The main yeoman generator - handles project initialisation and component generation
 */
var ComponentsGenerator = yeoman.generators.Base.extend({

  /**
   * @constructor
   * Defines init prompts
   * Parses task name to set various flags
   * If this isn't a project initialisation, try and read in the ACS config
   */
  init: function (arg) {
    this.acsNeedsInit = false;
    this.acsPage = false;
    this.quit = false;

    /**
     * {Array}
     * Contains prompts presented to user at project generation time
     */
    this.initPrompts = [
      // Confirm project generation
      {
        name: 'confirmInit',
        type: 'confirm',
        message: 'Do you want to init this directory for acs?'
      },
      // Ask for a package name to be used in package.json
      {
        when: function (response) {
          return response.confirmInit;
        },
        name: 'pkgName',
        message: 'Sweet! What identifier should we use for your app? (e.g. my-atomic-website)'
      },
      // Ask for the base URL at which the project is accessed over HTTP
      {
        when: function (response) {
          return response.pkgName;
        },
        name: 'baseUrl',
        message: 'And what\'s the local URL for this project? (e.g http://awesome.dev/)'
      },
      // Ask whether the project will be using Git
      {
        when: function (response) {
          return response.baseUrl;
        },
        name: 'isGit',
        type: 'confirm',
        message: 'Are you using Git?'
      },
      // Ask whether the user's name and email should be injected into the comment headers of generated files
      {
        when: function (response) {
          return response.isGit;
        },
        name: 'nameInHeader',
        type: 'confirm',
        message: 'Do you want your name and email to be placed in the header \nof all of the compoenents you create (This is useful in teams \nand acs will read these details from your gitconfig)?'
      }
    ];

    // Parse task name to determine course of action
    if(arg == 'init'){
      this.acsNeedsInit = true;
    }else if(arg == 'page'){
      this.acsPage = true;
    }

    // Read in ACS config if generating page or component
    var acsConfig = "acs_config.json";
    this.acsInitFile = false;

    if(!this.acsNeedsInit){
      try{
        this.acsInitFile = this.readFileAsString(acsConfig);
        this.acsInitFileJSON = JSON.parse(this.acsInitFile);
        this.isInit = true;
        this.identifiedComponents = this.acsInitFileJSON.identifiedComponents;
        this.name = this.acsInitFileJSON.name;
        this.email = this.acsInitFileJSON.email;
      }catch (e){
        console.log(chalk.red('acs_config.json not found. '), chalk.green('Running yo acs init...'));
        this.acsNeedsInit = true;
      }
    }

    var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    var config_file = home_dir+'/.gitconfig';
    var gitConfigStr = this.readFileAsString(config_file);

    // if gitconfig exists
    if (gitConfigStr) {
      console.log("Getting some information from the git configuration...");
      this.gitGlobalConfigFile = getGitInfo.parseConfig(gitConfigStr);
    }
    else {
      console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
    };

  },

  /**
   * Presents user with prompts for the requested task
   */
  askFor: function () {
    var done = this.async();
    var self = this;

    // if you are running the init
    if(this.acsNeedsInit){

      // Welcome message
      console.log(chalk.green('You\'re using the fantastic Atomic Componenet System /n more info: http://pjhauser.github.io/atomic-component-system/'));
      // Begin the interrogation
      this.prompt(this.initPrompts, function (response) {

          self.nameInHeader = response.nameInHeader;

          if(self.nameInHeader){
              // if the config exists and the user wants to add name and email to components
              if(self.gitGlobalConfigFile){
                self.name = self.gitGlobalConfigFile['user'].name;
                self.email = self.gitGlobalConfigFile['user'].email;
              // if the config doesn't exists and the user wants to add name and email to components
              }else{
                var prompts = [questions.userName, questions.userPassword]
                self.prompt(prompts, function (props) {
                  self.name = props.userName;
                  self.email = props.userEmail;
                }.bind(this));
              }
          }else{
              self.name = " ";
              self.email = " ";
          }

          self.baseUrl = response.baseUrl.replace(/\/+$/, "");;
          self.pkgName = response.pkgName;
          self.isGit = response.isGit;
          done();
      });

    // if you are running the page generator
    }else if(this.acsPage){
      // Grab template files
      var templates = fs.readdirSync("src/templates/");
      // Begin the interrogation
      this.prompt([questions.componentName, {
        when: function (response) {
          return response.componentName;
        },
        type: 'list',
        name: 'templateSelect',
        message: 'Which template do you want to use?',
        choices: templates,
      }], function (response) {
          self.componentType = "page";
          self.componentName = response.componentName;
          self.templateSelect = response.templateSelect;
          self.id = self.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          done();
      });

    // if you are running the component generator
    }else{

      var prompts = [questions.componentType, questions.componentName]
      this.prompt(prompts, function (props) {
        this.componentType = props.componentType;
        this.componentName = props.componentName;
        this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        done();
      }.bind(this));

    }

  },

  /**
   * Takes the user-entered data from askFor and runs the templating, either for project, component, template or page generation
   */
  app: function () {

    if(!this.quit){

      this.dirs = {
        // this is where we define our jade and jade demo paths
        jadeModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.jade',
        jadeDemoDir:  "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.jade',

        // this is where we define our js path
        jsModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.js',

        // this is where we define our sass and sass demo paths
        sassDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.scss',
        sassDemoDir: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.scss'
      };

      // Generating a template, page or component
      if(this.componentType){
        // Generating a page template
        if(this.componentType == 'template'){
          this.template('_template.jade', this.dirs.jadeModDir);
          this.template('_.js', this.dirs.jsModDir);
          this.template('_.scss', this.dirs.sassDir);
        // Generating a page instance
        }else if(this.componentType == 'page'){
          this.template('_page.jade', this.dirs.jadeModDir);
          this.template('_.js', this.dirs.jsModDir);
          this.template('_.scss', this.dirs.sassDir);
        // Generating a component
        }else{
          this.template('_.jade', this.dirs.jadeModDir);
          this.template('_demo.jade', this.dirs.jadeDemoDir);
          this.template('_.scss', this.dirs.sassDir);
          this.template('_demo.scss', this.dirs.sassDemoDir);
          this.template('_.js', this.dirs.jsModDir);
        }
      // Generating a new project
      }else{
          this.directory('init_templates/src', 'src');
          this.template('init_templates/_acs_config.tmpl.json', 'acs_config.json');
          this.template('init_templates/package.tmpl.json', 'package.json');
          this.copy('init_templates/Gruntfile.js', 'Gruntfile.js');
          this.copy('init_templates/README.md', 'README.md');
          if(this.isGit){
              this.copy('init_templates/gitignore', '.gitignore');
          }
      }
    }

  },

  projectfiles: function () {

  }
});

module.exports = ComponentsGenerator;

