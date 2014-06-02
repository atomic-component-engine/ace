'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var _ = require('lodash');

var getGitInfo = require('./get-git-info');

var dependencyResolver = require('./deps-resolver');

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
   * If this isn't a project initialisation, try and read in the ACE config
   */
  init: function (arg) {
    this.aceNeedsInit = false;
    this.acePage = false;
    this.quit = false;
    this.aceExport = false;

    /**
     * {Array}
     * Contains prompts presented to user at project generation time
     */
    this.initPrompts = [
      // Confirm project generation
      {
        name: 'confirmInit',
        type: 'confirm',
        message: 'Do you want to init this directory for ACE?'
      },
      // Ask for a package name to be used in package.json
      {
        when: function (response) {
          if(!response.confirmInit){
            this.quit = true;
          }
          return response.confirmInit;
        },
        name: 'pkgName',
        message: 'Sweet! What identifier should we use for your app? (e.g. my-atomic-website)'
      },
      // Ask whether the project will be using Git
      {
        when: function (response) {
          return response.pkgName;
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
        message: 'Do you want your name and email to be placed in the header \nof all of the compoenents you create (This is useful in teams \nand ace will read these details from your gitconfig)?'
      }
    ];

    // Parse task name to determine course of action
    if(arg == 'init'){
      this.aceNeedsInit = true;
    }else if(arg == 'page'){
      this.acePage = true;
    }else if(arg == 'export'){
      this.aceExport = true;
    }

    // Read in ace config if generating page or component
    var aceConfig = "ace_config.json";
    this.aceInitFile = false;

    if(!this.aceNeedsInit){
      try{
        this.aceInitFile = this.readFileAsString(aceConfig);
        this.aceInitFileJSON = JSON.parse(this.aceInitFile);
        this.isInit = true;
        this.identifiedComponents = this.aceInitFileJSON.identifiedComponents;
        this.name = this.aceInitFileJSON.name;
        this.email = this.aceInitFileJSON.email;
      }catch (e){
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
    if(this.aceNeedsInit){

      // Welcome message
      console.log(chalk.green('You\'re using the fantastic Atomic Componenet Engine'))
      console.log(chalk.green('more info: http://pjhauser.github.io/atomic-component-engine/'));
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

          self.pkgName = response.pkgName;
          self.isGit = response.isGit;
          done();
      });

    // if you are running the page generator
    }else if(this.acePage){
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
    }else if(this.aceExport){

      var self = this;
      var exportPkg = {};
      var componentList = [];
      var jadeDeps = [];
      var match;

      // Begin the interrogation
      this.prompt([
      {
        type: 'list',
        name: 'exportSelectType',
        message: 'What type would you like to export?',
        choices: questions.componentType.choices
      },{
        when: function (response) {
          return true;
        },
        type: 'list',
        name: 'componentSelect',
        message: 'Which component do you want to export?',
        choices: function(response){
          componentList = fs.readdirSync("src/" + response.exportSelectType.toLowerCase() + "s");
          return componentList;
        },
      }
      ], function (response) {
          var compType = response.exportSelectType.toLowerCase();
          var compName = response.componentSelect;
          var depRes = new dependencyResolver({
            type: compType,
            name: compName
          });

          // Get implied dependencies
          var impliedDeps = depRes.getImpliedDeps();
          // Get user-defined dependencies
          var explicitDeps = depRes.getExplicitDeps();

          self.deps = _.union([], impliedDeps, explicitDeps);
          console.log('Found deps:', self.deps);

          self.fileToExport = compType + "s/" + compName;
          
          //self.quit = true;
          done();
      });


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
        jadePageModDir: "src/" + this.componentType + 's/_' + this.id + '/' + this.id + '.jade',
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
      }else if(this.aceExport){
          console.log(chalk.green("Export complete"));
      }else{
          this.directory('init_templates/src', 'src');
          this.template('init_templates/_ace_config.tmpl.json', 'ace_config.json');
          this.template('init_templates/_ace.sublime-project.tmpl', 'ace.sublime-project');
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

