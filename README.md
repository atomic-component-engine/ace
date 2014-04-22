Atomic Component System v0.1.7 - *PRE-RELEASE*
=======================


* [Quick Start](#quick)
	* [Getting Started](#getting-started)
 	* [ACS Init](#acs-init)
 	* [Component generation](#component-generation)
 	* [Page generation](#page-generation)
* [Object Oriented Frontend](#object-orientation-in-the-frontend)
* [Nitty Gritty](#nitty)
	* [Boilerplate](#boilerplate)
	* [Component factory](#component-factory)
	* [File structure](#file-structure)
* [Todos](#todos)

ACS is a system for creating and maintaining Frontend projects. It builds on the ideas forwarded by [Brad Frost](http://bradfrostweb.com/blog/post/atomic-web-design/) where instead of designing pages, we design and develop a system of components. 

This system has 2 main elements. The boilerplate, which consists of a Grunt based project, and a component generator, both of which are managed by Yeoman. 


###Quick Start

#### Getting Started

1. Download the zip.
2. `cd` into the yeoman directory
3. Run `npm install -g`
4. Run `npm link`
5. cd into the working directory of your project
6. Run `yo acs init` and follow the instructions


#### ACS Init
This task initialises the directory with the main boilerplate. You will be asked 4 questions:

1. Do you want to init this directory with ACS (Y/n)
2. What is the base URL of the directory? *This is for the script and css paths of the template*
3. Are you using Git? *This will add the base gitignore*
4. Do you want your name and email to be placed in the header of all of the compoenents you create? *This is useful in teams and acs will read these details from your gitconfig if present*


Now your directory has the base boilerplate you'll want to start creating components. 


#### Component generation

You can use the same yeoman generator to create components. Just type:

1. yo acs
2. Select component type
3. Name component
4. *(optional)* Type name
5. *(optional)* Enter email


#### Page generation

Pages are a little different to compoenents, ideally these should have minimal CSS and JS, as this should all be performed on the sub-page component level. 

1. yo acs page
2. Name component / page
3. Select template type

---


### Todos 
* Create an example webpage using this generator. 