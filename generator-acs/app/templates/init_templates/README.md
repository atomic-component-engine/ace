#Front-end project boilerplate#

##Introduction##
This project is a starting point for front-end development projects using a [Grunt JS](http://gruntjs.com/) workflow. It uses [SASS](http://sass-lang.com/) as a CSS preprocessor and [Jade](http://jade-lang.com/) as a HTML preprocessor. 

##Dependencies##

- [Node JS](http://nodejs.org/) (packages listed in package.json)
- [Ruby](https://www.ruby-lang.org/), with the following gems installed:
	- sass
	- sass-globbing
	- compass

##Usage##
Once checked out, install the node modules:

```> npm install```

You should now be able to run grunt to compile the project:

```> grunt dev```

This will build the project out into the dev/ folder, with uncombined, unminified JS. It will then watch the project for changes and compile upon file writes.

To build a release for testing/production, type

```> grunt release```

Individual grunt tasks can also be run one-off if necessary:

```> grunt js```

```> grunt copy:img```
