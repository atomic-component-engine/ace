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

        return value[ 'remote "origin"' ].url;
    }
};


var ComponentsGenerator = yeoman.generators.Base.extend({
  init: function () {

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.npmInstall();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    console.log(this.yeoman);

    var path = ".git/config";
    var file = this.readFileAsString(path);

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta('You\'re using the fantastic Components generator.'));

    if(getGitInfo.parseConfig(file)){
      console.log(chalk.green("Git remote:" + getGitInfo.parseConfig(file)));
    }else{
      console.log(chalk.red("No git remote spicified"));
    }

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

    
    if(this.componentType == "template"){
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

  },

  projectfiles: function () {
    // this.copy('editorconfig', '.editorconfig');
    // this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = ComponentsGenerator;

