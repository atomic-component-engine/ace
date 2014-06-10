'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var _ = require('lodash');
var archiver = require('archiver');
var deleteFolderRecursive = require('./deleteFolderRecursive');

var getGitInfo = require('./get-git-info');

var DependencyResolver = require('./deps-resolver');
var ProjectHelper = require('./project-helper');
var ComponentHelper = require('./component-helper');


/**
 * {String}
 * The root folder of the project upon which the generator is running
 */
var projectRoot = process.cwd();

var projectSrc = projectRoot + '/src/';
var projectSASS = projectSrc + 'global-scss/';
var projectJS = projectSrc + 'global-js/';
var projectExport = projectRoot + '/export/';

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

var aceJson = {

  create: function(configFile, componentName, componentAuthor){
    console.log(chalk.red("dep config doesn't exist... Creating a base config file:"));
    var config = {
      "name": componentName,
      "author": componentAuthor,
       "dependencies": {
           "components": [],
           "js": [],
           "sass": []
       }
    };
    var buf = new Buffer(JSON.stringify(config), 'utf-8');
    fs.writeSync(fs.openSync(configFile, 'w'), buf, null, buf.length, null);
  },

  getConfig: function(configFile){
    var config = JSON.parse(fs.readFileSync(configFile, "utf8"));
    return config;
  },

  addDependency: function(baseComponent, type, name){

    var configFile = "src/" + baseComponent + "/ace.json";
    var config = aceJson.getConfig(configFile);
    var alreadyAdded = false;
    var type = type.toLowerCase();
    var dependencyList = config.dependencies[type];

    console.log(baseComponent, type, name);

    for(var i=0;i<dependencyList.length;i++){
      if(dependencyList[i] == name){
        alreadyAdded = true;
      }
    }

    if(!alreadyAdded){
      config.dependencies[type].push(name);
    }else{
      console.log(chalk.red("You have already added this dependency"));
    }

    var buf = new Buffer(JSON.stringify(config, null, 4), 'utf-8');
    fs.writeSync(fs.openSync(configFile, 'w'), buf, null, buf.length, null);

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
    this.projectHelper = new ProjectHelper();

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
    switch(arg) {
        case "init":
          this.aceNeedsInit = true;
            break;
        case "page":
          this.acePage = true;
            break;
        case "export":
          this.aceExport = true;
            break;
        case "add-dependency":
          this.addDep = true;
            break;
        case "help":
          this.aceHelp = true;
            break;
        default:
          this.addCompoenent = true;
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
    }else {
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
        // Get type and name of component so we can find it
        self.exportComponent = {
          type: response.exportSelectType.toLowerCase(),
          name: response.componentSelect
        }

        done();
      });

    }else if(this.addDep){

      var self = this;
      var componentList = [];
      var sassList = [];
      var jsList = [];

      // Begin the interrogation
      this.prompt([
      {
        type: 'list',
        name: 'dependancyType',
        message: 'What type of dependancy do you want to add?',
        choices: ["Component", "SASS", "JS"]
      },{
        when: function (response) {
          return true;
        },
        type: 'list',
        name: 'selectComponentType',
        message: 'What component do you want to add a dependency to?',
        choices: questions.componentType.choices
      },{
        when: function (response) {
          return true;
        },
        type: 'list',
        name: 'componentSelect',
        message: 'Select component',
        choices: function(response){
          componentList = fs.readdirSync("src/" + response.selectComponentType.toLowerCase() + "s");
          return componentList;
        },
      },{
        when: function (response) {
          if(response.dependancyType == "Component"){
            return true;
          }else{
            return false;
          }
        },
        type: 'list',
        name: 'selectDependancyComponentType',
        message: 'Select dependancy to add',
        choices: questions.componentType.choices
      },{
        when: function (response) {
          if(response.dependancyType == "Component"){
            return true;
          }else{
            return false;
          }
        },
        type: 'list',
        name: 'depComponentSelect',
        message: 'Select component',
        choices: function(response){
          if(response.selectDependancyComponentType){
            componentList = fs.readdirSync("src/" + response.selectDependancyComponentType.toLowerCase() + "s");
          };
          return componentList;
        },
      },{
        when: function (response) {
          if(response.dependancyType == "SASS"){
            return true;
          }else{
            return false;
          }
        },
        type: 'list',
        name: 'selectDependancySASSDir',
        message: 'Select SASS dependancy to add',
        choices: function(response){
          if(response.dependancyType == "SASS"){
            sassList = fs.readdirSync("src/global-scss");
          };
          return sassList;
        },
      },{
        when: function (response) {
          if(response.dependancyType == "JS"){
            return true;
          }else{
            return false;
          }
        },
        type: 'list',
        name: 'selectDependancyJSDir',
        message: 'Select JS dependancy to add',
        choices: function(response){
          if(response.dependancyType == "JS"){
            jsList = fs.readdirSync("src/global-js");
          };
          return jsList;
        },
      }
      ], function (response) {
        var configFile = "src/" + response.selectComponentType.toLowerCase() + "s/" + response.componentSelect + "/ace.json";

        if (!fs.existsSync(configFile)) {
          aceJson.create(configFile, response.componentSelect, JSON.parse(self.aceInitFile).email);
        }

        var config = self.readFileAsString(configFile);

        switch(response.dependancyType) {
            case "Component":
                var dependancyName = response.selectDependancyComponentType.toLowerCase() + "s/" + response.depComponentSelect;
                break;
            case "SASS":
                var dependancyName = "global-scss/" + response.selectDependancySASSDir;
                break;
            case "JS":
                var dependancyName = "global-js/" + response.selectDependancyJSDir;
                break;
            default:
                console.log(chalk.red("Invalid dependancy type"));
        }

        this.dependancyName = dependancyName;
        this.baseComponent = response.selectComponentType.toLowerCase() + "s/" + response.componentSelect;
        this.dependancyType = response.dependancyType

        done();
      });



    }else if(this.aceHelp){
      var helpMessage = " \n\
      \n \
        Welcome to ACE: \n \
      \n \
      \n \
        yo ace init           -> This will add the initial boilerplate to your current directory. \n \
        yo ace                -> This will give you a list of options for creating compoenents. \n \
        yo ace add-dependency -> This will add a dependency to a component. \n \
        yo ace export         -> This will zip up your component and its dependencies. \n \n \n "

      console.log(helpMessage);
      this.quit = true;
      done();
    }else if(this.addCompoenent){

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

          var self = this;

          /**
           * {ComponentHelper}
           */
          self.componentHelper = new ComponentHelper({
            type: self.exportComponent.type,
            name: self.exportComponent.name,
          });
          /**
           * {DependencyResolver}
           */
          var depRes = new DependencyResolver(self.projectHelper, self.componentHelper);

          // Get implied dependencies
          var impliedDeps = depRes.getImpliedDeps();
          // Get explicit (config-defined) dependencies
          var explicitDeps = depRes.getExplicitDeps();

          // Merge implied and explicit dependencies
          self.compDeps = _.union([], impliedDeps.components, explicitDeps.components);
          self.jsDeps = _.union([], impliedDeps.js, explicitDeps.js);
          self.sassDeps = _.union([], impliedDeps.sass, explicitDeps.sass);
          console.log('Component deps:', self.compDeps);
          console.log('Global SASS deps:', self.sassDeps);
          console.log('Global JS deps:', self.jsDeps);
          
          // Build component folder path
          self.fileToExport = self.exportComponent.type + "s/" + self.exportComponent.name;

          // Copy component to export folder
          self.directory(projectSrc+self.fileToExport, projectExport+self.fileToExport);

          self.exportedFiles = [];
          self.exportedFiles.push(self.fileToExport + "/**");

          // Copy dependency components to export folder
          self.compDeps.forEach(function (component) {
            self.directory(projectSrc+component, projectExport+component);
            self.exportedFiles.push(component + "/**");
          });

          // Copy global SASS dependencies to export folder
          self.sassDeps.forEach(function (sassDep) {
            self.copy(projectSASS+'mixins/'+sassDep, projectExport+'global-scss/mixins/'+sassDep)
            self.exportedFiles.push('global-scss/mixins/'+sassDep+"**");
          });

          // Copy global JS dependencies to export folder
          self.jsDeps.forEach(function (jsDep) {
            self.copy(projectJS+jsDep, projectExport+'global-js/'+jsDep)
            self.exportedFiles.push('global-js/'+jsDep);
          });

          var output = fs.createWriteStream('export/' + this.compName + '.zip');
          var archive = archiver('zip');

          archive.on('error', function(err){
              throw err;
          });

          archive.pipe(output);

          archive.bulk([
              { expand: true, cwd: 'export', src: self.exportedFiles, dest: 'export'}
          ]);
          archive.finalize();

          archive.on('error', function(err){
              throw err;
          });

          output.on('finish', function () {
            setTimeout(function(){
              for(var i=0;i<self.exportedFiles.length;i++){
                var exportedFilePath = self.exportedFiles[i].split("/");
                exportedFilePath.pop();
                var exportedFilePath = exportedFilePath.join();
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
                if (fs.existsSync(projectExport+emptyDir)) fs.rmdirSync(projectExport+emptyDir);
              });

              console.log(chalk.green("Export complete"));
            },3000);
          });

      }else if(this.addDep){

        aceJson.addDependency(self.baseComponent, self.dependancyType, self.dependancyName);

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

