![logo](https://raw.githubusercontent.com/pjhauser/atomic-component-engine/develop/gifs/ace-molecule-logo.png)

ACE v0.5.5 - *Mini bootstrap for every project*
=======================

### Dependencies 
[Node.js](http://nodejs.org/download/)

---

* [Quick Start](#quick)
	* [Getting Started](#getting-started)
 	* [ACE Init](#ace-init)
 	* [Component generation](#component-generation)
 	* [Page generation](#page-generation)

* [Sublime Text Project](#sublime-text-project)
* [Todos](#todos)

ACE is a system for creating and maintaining Frontend projects. It builds on the ideas forwarded by [Brad Frost](http://bradfrostweb.com/blog/post/atomic-web-design/) where instead of designing pages, we design and develop a system of components. 

This system has 2 main elements. The boilerplate, which consists of a Grunt based project, and a component generator, both of which are managed by Yeoman. 


#### Getting Started

![install generator](https://raw.githubusercontent.com/pjhauser/atomic-component-system/master/gifs/install.gif)


1. Download the [zip](https://github.com/pjhauser/atomic-component-system/archive/master.zip).
2. Extract the downloaded zip
3. `cd` into the `generator-ace` directory
4. Run `npm install -g`
5. cd into the working directory of your project
6. Run `yo ace` and follow the instructions


#### ace Init

![init generator](https://raw.githubusercontent.com/pjhauser/atomic-component-engine/master/gifs/init.gif)

This task initialises the directory with the main boilerplate. You will be asked 4 questions:

1. Do you want to init this directory with ACE (Y/n)
2. Sweet! What identifier should we use for your app? (e.g. my-atomic-website) *This is the name of your project in the package.json file*
3. Are you using Git? *This will add a base gitignore*
4. Do you want your name and email to be placed in the header of all of the compoenents you create? *This is useful in teams and ace will read these details from your gitconfig if present*


Now your directory has the ACE boilerplate you'll want to start creating components. 


#### Component generation

You can use the same yeoman generator to create components. Just type:

1. `yo ace` *ACE knows if the project is an ACE project and decides to run either init or the component generator*
2. Select component type
3. Name component

The generator will then create a component in the following folder structure:

	| --> /atoms
		  |--> /_atom_name
			   | --> _atom_name.jade
			   | --> _atom_name.js
			   | --> _atom_name.sass
			   | --> _demo_atom_name.jade


#### Page generation

Pages are a little different to components, ideally these should have minimal CSS and JS, as this should all be performed on the sub-page component level. 

1. `yo ace:page`
2. Name component / page
3. Select template type *ACE will give you a choice of templates that your page will inherit, this is read from your templates dir*

---

### Dependency Management and Exporting


#### ACE Add-dependency

If your component has a dependency you can add it to the ace.json file with the following:

1. Type `yo ace:add-dependency`
2. Select a component to add a dependency to
3. Select a dependency type to add to that component
4. Select a depedency to add

*This will add the dependency to ace.json which is used for exporting, you will currently still need to add the dependency to your component in code.*

#### ACE Export
ACE lets you export compoenents to move them between projects, this means that you can create your own library of ACE components to speed up prototyping and development.

To export with ACE you:

1. Type `yo ace:export`
2. Select a component to export

You'll now find an export directory in the root of your project with the ace component and its dependencies packaged up in a zip.


---

### Sublime Text Project
Included in the init boilerplate is a file named `ace.sublime-project`. Opening this file will launch sublime text with a custom file structure and some other small settings. File structure:

	| --> /src
	| --> /01. Atoms
	| --> /02. Molecules
	| --> /03. Organisms
	| --> /04. Templates
	| --> /05. Pages

---

### Wiki
Check the wiki for more details about ACE

### Licenses 
This project is open sourced under the GPL v2 licenses. This means that anyone who distributes this code or a derivative work must make the source available under the same terms.

### Contributing
We welcome pull requests. This project uses [nvie](https://github.com/nvie)'s super helpful [gitflow](https://github.com/nvie/gitflow) branching model; as such please branch your features from ```develop```


