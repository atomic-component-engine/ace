'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

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

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta('You\'re using the fantastic Components generator.'));

    var prompts = [{
      type: 'list',
      name: 'componentType',
      message: 'What type would you like to generate?',
      choices: [
      'Atom',
      'Molecule',
      'Organism'
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
      jadeModDir: "src/jade/mixins/" + this.componentType + "s/" + this.id,
      jadePgDir:  "src/jade/" + this.componentType + "s/" + this.id,
      jsDir: "src/js/" + this.componentType + "s/",
      jsModDir: "src/js/" + this.componentType + "s/" + this.id,
      sassDir: "src/sass/" + this.componentType + "s/_" + this.id,
      sassDemoDir: "src/sass/pages/"
    };
    // this.mkdir('app');
    // this.mkdir('app/templates');
    //Create Sass File
    this.template('_.scss', this.dirs.sassDir + '.scss');
    //Create Sass Demo File
    this.template('_demo.scss', this.dirs.sassDemoDir + '_' + this.id + '_demo.scss');
    //Create JS Module File
    this.template('_.js', this.dirs.jsModDir + '.js');
    //Create JS Demo File
    this.template('_demo.js', this.dirs.jsDir + '_demo.js');
    //Create Jade Module File
    this.template('_.jade', this.dirs.jadeModDir + '_.jade');
    //Create Jade Page File
    this.template('_demo.jade', this.dirs.jadePgDir + '_demo.jade');
  },

  projectfiles: function () {
    // this.copy('editorconfig', '.editorconfig');
    // this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = ComponentsGenerator;
