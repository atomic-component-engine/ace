ACS v0.1.7 - *PRE-RELEASE*
=======================


* [Quick Start](#quick)
	* [Getting Started](#getting-started)
 	* [ACS Init](#acs-init)
 	* [Component generation](#component-generation)
 	* [Page generation](#page-generation)

* [Todos](#todos)

ACS is a system for creating and maintaining Frontend projects. It builds on the ideas forwarded by [Brad Frost](http://bradfrostweb.com/blog/post/atomic-web-design/) where instead of designing pages, we design and develop a system of components. 

This system has 2 main elements. The boilerplate, which consists of a Grunt based project, and a component generator, both of which are managed by Yeoman. 


#### Getting Started

1. Download the [zip](https://github.com/pjhauser/atomic-component-system/archive/master.zip).
2. Extract the downloaded zip
3. `cd` into the unzipped directory
4. Run `npm install -g`
5. Run `npm link`
6. cd into the working directory of your project
7. Run `yo acs init` and follow the instructions


#### ACS Init
This task initialises the directory with the main boilerplate. You will be asked 5 questions:

1. Do you want to init this directory with ACS (Y/n)
2. Sweet! What identifier should we use for your app? (e.g. my-atomic-website) *This is the name of your project in the package.json file*
3. What is the base URL of the directory? *This is for the script and css paths of the template*
4. Are you using Git? *This will add the base gitignore*
5. Do you want your name and email to be placed in the header of all of the compoenents you create? *This is useful in teams and acs will read these details from your gitconfig if present*


Now your directory has the base boilerplate you'll want to start creating components. 


#### Component generation

You can use the same yeoman generator to create components. Just type:

1. yo acs
2. Select component type
3. Name component

The generator will then create a component in the following folder structure:

	| --> /atoms
		  |--> /atom_name
			   | --> atom_name.jade
			   | --> atom_name.js
			   | --> atom_name.sass
			   | --> demo_atom_name.jade


#### Page generation

Pages are a little different to compoenents, ideally these should have minimal CSS and JS, as this should all be performed on the sub-page component level. 

1. yo acs page
2. Name component / page
3. Select template type

---


### Todos 
* Create an example webpage using this generator. 