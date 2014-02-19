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
      jadeModDir: "src/jade/mixins/" + this.componentType + 's/' + this.id + '.jade',
      jadePgDir:  "src/jade/demo_" + this.id  + '.jade',
      jsDemoDir: "src/js/demo_" + this.id + '.js' ,
      jsModDir: "src/js/" + this.componentType + "s/" + this.id  + '.js',
      sassDir: "src/sass/" + this.componentType + "s/_" + this.id  + '.scss',
      sassDemoDir: "src/sass/pages/"  + '_' + this.id + '_demo.scss'
    };
    // this.mkdir('app');
    // this.mkdir('app/templates');
    //Create Sass File
    this.template('_.scss', this.dirs.sassDir); //Correct
    //Create Sass Demo File
    this.template('_demo.scss', this.dirs.sassDemoDir); //Correct
    //Create JS Module File
    this.template('_.js', this.dirs.jsModDir); //Correct
    //Create JS Demo File
    this.template('_demo.js', this.dirs.jsDemoDir);
    //Create Jade Module File
    this.template('_.jade', this.dirs.jadeModDir);
    //Create Jade Page File
    this.template('_demo.jade', this.dirs.jadePgDir);
  },

  projectfiles: function () {
    // this.copy('editorconfig', '.editorconfig');
    // this.copy('jshintrc', '.jshintrc');
  }
});

module.exports = ComponentsGenerator;
