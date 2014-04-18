atomic-component-system v0.1.0
=======================


* [Quick Start](#quick)
	* [Getting Started](#getting-started)
 	* [ACS Init](#acs-init)
* [Object Oriebted Frontend](#object-orientation-in-the-frontend)
* [Nitty Gritty](#nitty)
	* [Boilerplate](#boilerplate)
	* [Component factory](#component-factory)
	* [File structure](#file-structure)
* [Todos](#todos)

ACS is a system for creating and maintaining Frontend projects. It builds on the ideas forwarded by [Brad Frost](http://bradfrostweb.com/blog/post/atomic-web-design/) where instead of designing pages, we design and develop a system of components. 

This system has 2 main elements. [The boilerplate](https://github.com/pjhauser/front-end-boilerplate), which consists of a Grunt based project, and a [component generator](https://github.com/pjhauser/component-generator) both of which are managed by Yeoman. 


###Quick Start

#### Getting Started

1. Clone the repo.
2. Run `npm install -g`
3. Run `npm link`
4. cd into the working directory of your project
5. Run `yo acs init`


#### ACS Init
This task initialises the directory with the main boilerplate. You will be asked just 3 questions:

1. Do you want to init this directory with ACS (Y/n)
2. What is the base URL of the directory? *This is for the script and css paths of the template*
3. Are you using Git? *This will add the base gitignore*

Now your directory has the base boilerplate you'll want to start creating components. 


#### Component generation

You can use the same yeoman generator to create components. Just type:

1. yo acs
2. Select component type
3. Name component


### Object orientation in the Frontend
Atomic design is an Object Oriented methodology for frontend development. It focuses on creating a set of base components, and inheriting them into parent component groups. 

![Atomic Design Diagram](http://bradfrostweb.com/wp-content/uploads/2013/06/atomic-design.png)

This this method of inheritance is not yet possible with HTML and CSS. We need an abstraction layer and build process. This is where we introduce three fundamental aspects of ACS. 

* [Jade](https://github.com/visionmedia/jade)
* [SASS](https://github.com/nex3/sass)
* [Grunt](https://github.com/gruntjs/grunt)

Jade and SASS form our abstraction layers, and Grunt forms our build process. 

Jade offers a flexible templating engine that allows for mixins and includes. The flexibility of the engine and it's compatibility with Grunt. 


### Nitty Gritty
#### Boilerplate
If you clone the [main boilerplate project](https://github.com/pjhauser/front-end-boilerplate) this gives you the project scaffolding and Gruntfile. Eventually this can be moved into a Yeoman generator but for now just clone the project and rename the directory to you're respective component factory. 

#### Component factory
Once you have the boilerplate in you'll need to install the Yeoman component generator. This is the day-to-day generator. [Grab the project](https://github.com/pjhauser/component-generator) and `cd` into the directory. Once in you'll want to `npm install -g` which will install the generator, and then `npm link`. 

Now you'll have the generator installed and ready to use. 

#### File structure
	src
	  | --> /atoms
	  		   |--> /atom_name
	  				  | --> atom_name.jade
	  				  | --> atom_name.js
	  				  | --> atom_name.sass
	  				  | --> demo_atom_name.jade
	  				  		  	  
	  | --> /molecules
	  | --> /organisms
	  | --> /templates
	  | --> /global-js
	  | --> /global-sass


### Todos 
* Create an example webpage using this generator. 