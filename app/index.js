'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');


var getGitInfo = {
    parseConfig: function(file){

        var regex = {
          section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
          param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
          comment: /^\s*;.*$/
        };


        var value = {};
        var lines = file.split(/\r\n|\r|\n/);
        var section = null;
        lines.forEach(function(line){
          if(regex.comment.test(line)){
            return;
          }else if(regex.param.test(line)){
            var match = line.match(regex.param);
            if(section){
              value[section][match[1]] = match[2];
            }else{
              value[match[1]] = match[2];
            }
          }else if(regex.section.test(line)){
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
          }else if(line.length == 0 && section){
            section = null;
          };
        });

        return value;
    }
};

// This object contains common questions
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


var ComponentsGenerator = yeoman.generators.Base.extend({
  init: function (arg) {
    this.acsNeedsInit = false;
    this.acsPage = false;
    this.quit = false;

    if(arg == 'init'){
      this.acsNeedsInit = true;
    }else if(arg == 'page'){
      this.acsPage = true;
    }

    var acsConfig = "acs_config.json";
    var file = false;

    if(!this.acsNeedsInit){
      try{
        var file = this.readFileAsString(acsConfig);
        this.isInit = true;
        this.identifiedComponents = JSON.parse(file).identifiedComponents;
      }catch (e){
        console.log(chalk.red('acs_config.json not found. '), chalk.green('Running yo acs init...'));
        this.acsNeedsInit = true;
      }
    }

  },

  askFor: function () {
    var done = this.async();
    var self = this;

    // if you are running the init
    if(this.acsNeedsInit){

      console.log(chalk.green('You\'re using the fantastic Atomic Componenet System /n more info: http://pjhauser.github.io/atomic-component-system/'));

      this.prompt([{
        name: 'confirmInit',
        type: 'confirm',
        message: 'Do you want to init this directory for acs?'
      }, {
        when: function (response) {
          return response.confirmInit;
        },
        name: 'baseUrl',
        message: 'Sweet! Whats the local URL for this project? (e.g http://awesome.dev/)'
      }, {
        when: function (response) {
          return response.baseUrl;
        },
        name: 'isGit',
        type: 'confirm',
        message: 'Are you using Git?'
      }, {
        when: function (response) {
          return response.isGit;
        },
        name: 'nameInHeader',
        type: 'confirm',
        message: 'Do you want your name and email to be placed in the header \nof all of the compoenents you create (This is useful in teams \nand acs will read these details from your gitconfig)?'
      }], function (response) {
          self.nameInHeader = response.nameInHeader;
          self.baseUrl = response.baseUrl.replace(/\/+$/, "");;
          self.isGit = response.isGit;
          done();
      });

    // if you are running the compoenent generator
    }else if(this.acsPage){

      var templates = fs.readdirSync("src/templates/");

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
          self.name = " ";
          self.email = " ";
          self.id = self.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          done();
      });

    }else{

      var gitConfig = ".git/config";

      // if the init file exists
      var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      var config_file = home_dir+'/.gitconfig';
      var gitConfigStr = this.readFileAsString(config_file);

      // if gitconfig exists
      if (gitConfigStr) {
        console.log("Getting some information from the git configuration...");
        var gitGlobalConfigFile = getGitInfo.parseConfig(gitConfigStr);
      }
      else {
        console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
      };

      // if the config exists and the user wants to add name and email to components
      if((gitGlobalConfigFile) && (this.identifiedComponents)){

        var prompts = [questions.componentType,questions.componentName];

        this.prompt(prompts, function (props) {
          this.componentType = props.componentType;
          this.componentName = props.componentName;
          this.name = gitGlobalConfigFile['user'].name;
          this.email = gitGlobalConfigFile['user'].email;
          this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          done();
        }.bind(this));

      // if the user doesn't want to add name and email to components
      }else if(!this.identifiedComponents){

        var prompts = [questions.componentType,questions.componentName];

        this.prompt(prompts, function (props) {
          this.componentType = props.componentType;
          this.componentName = props.componentName;
          this.name = " ";
          this.email = " ";
          this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          done();
        }.bind(this));
    
      // if the config doesn't exists and the user wants to add name and email to components
      }else if((!gitGlobalConfigFile) && (this.identifiedComponents)){

          var prompts = [questions.componentType,questions.componentName,questions.userName,questions.userEmail];

          this.prompt(prompts, function (props) {
            this.componentType = props.componentType;
            this.componentName = props.componentName;
            this.name = props.userName;
            this.email = props.userEmail
            this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            done();
          }.bind(this));
      }else{
          console.log(chalk.red("Error"));
      }

    }

  },

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

      if(this.componentType){
        if(this.componentType == 'template'){
          this.template('_template.jade', this.dirs.jadeModDir);
          this.template('_.js', this.dirs.jsModDir);
          this.template('_.scss', this.dirs.sassDir);
        }else if(this.componentType == 'page'){
          this.template('_page.jade', this.dirs.jadeModDir);
          this.template('_.js', this.dirs.jsModDir);
          this.template('_.scss', this.dirs.sassDir);
        }else{
          this.template('_.jade', this.dirs.jadeModDir);
          this.template('_demo.jade', this.dirs.jadeDemoDir);
          this.template('_.scss', this.dirs.sassDir);
          this.template('_demo.scss', this.dirs.sassDemoDir);
          this.template('_.js', this.dirs.jsModDir);
        }
      }else{
          this.directory('init_templates/src', 'src');
          this.template('init_templates/_acs_config.tmpl.json', 'acs_config.json');
          this.copy('init_templates/Gruntfile.js', 'Gruntfile.js');
          this.copy('init_templates/package.json', 'package.json');
          this.copy('init_templates/README.md', 'README.md');
          if(this.isGit){
              this.copy('init_templates/gitignore', '.gitignore');
              console.log(chalk.green('You now have the default .gitignore'));
          }
      }
    }

  },

  projectfiles: function () {

  }
});

module.exports = ComponentsGenerator;

