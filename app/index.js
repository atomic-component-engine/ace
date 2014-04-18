'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


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


var ComponentsGenerator = yeoman.generators.Base.extend({
  init: function (arg) {
    if(arg == 'init'){
      this.acsInit = true;
    }
  },

  askFor: function () {
    var done = this.async();
    var self = this;

    if(this.acsInit){

      console.log(chalk.green('You\'re using the fantastic Atomic Componenet System'));

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
      }], function (response) {
          self.baseUrl = response.baseUrl;
          self.isGit = response.isGit;
          done();
      });

    }else{

      var gitConfig = ".git/config";
      var acsConfig = "acs_config.json";
      var file = false;

      try{
        var file = this.readFileAsString(acsConfig);
        this.isInit = true;
      }catch (e){
        console.log(chalk.red('acs_config.json not found. You either needs to init the project with "yo acs init" or add the config file back in'));
      }

      if(this.isInit){

          var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
          var config_file = home_dir+'/.gitconfig';
          var gitConfigStr = this.readFileAsString(config_file);

          if (gitConfigStr) {
            console.log("Getting some information from the git configuration...");
            var gitGlobalConfigFile = getGitInfo.parseConfig(gitConfigStr);
          }
          else {
            console.log(chalk.red("Git configuration file does not exist, this is used in template headers..."));
          };


          if(gitGlobalConfigFile){

            var prompts = [{
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
            {
              type: 'item',
              name: 'componentName',
              message: 'What would you like to call the component?'
            }
            ];

            this.prompt(prompts, function (props) {
              this.componentType = props.componentType;
              this.componentName = props.componentName;
              this.name = gitGlobalConfigFile['user'].name;
              this.email = gitGlobalConfigFile['user'].email
              this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
              done();
            }.bind(this));

          }else{

            var prompts = [{
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
            {
              type: 'item',
              name: 'componentName',
              message: 'What would you like to call the component?'
            },
            {
              type: 'item',
              name: 'userName',
              message: 'What is your name?'
            },
            {
              type: 'item',
              name: 'userEmail',
              message: 'What is your email address?'
            }
            ];

            this.prompt(prompts, function (props) {
              this.componentType = props.componentType;
              this.componentName = props.componentName;
              this.name = props.userName;
              this.email = props.userEmail
              this.id = this.componentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
              done();
            }.bind(this));
        }

      }

    }
  },

  app: function () {

    this.dirs = {
      // this is where we define our jade and jade demo paths
      jadeModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.jade',
      jadeDemoDir:  "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.jade',

      // this is where we define our js and js demo paths
      jsModDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.js',
      jsDemoDir: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.js',

      // this is where we define our sass and sass demo paths
      sassDir: "src/" + this.componentType + 's/_' + this.id + '/_' + this.id + '.scss',
      sassDemoDir: "src/" + this.componentType + 's/_' + this.id + '/_demo_' + this.id + '.scss'
    };

    if(this.componentType){
      if(this.componentType == 'template'){
        this.template('_template.jade', this.dirs.jadeModDir);
        this.template('_.js', this.dirs.jsModDir);
        this.template('_.scss', this.dirs.sassDir);
      }else{
        this.template('_.jade', this.dirs.jadeModDir);
        this.template('_demo.jade', this.dirs.jadeDemoDir);
        this.template('_.scss', this.dirs.sassDir);
        this.template('_demo.scss', this.dirs.sassDemoDir);
        this.template('_.js', this.dirs.jsModDir);
        this.template('_demo.js', this.dirs.jsDemoDir);
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

  },

  projectfiles: function () {

  }
});

module.exports = ComponentsGenerator;

