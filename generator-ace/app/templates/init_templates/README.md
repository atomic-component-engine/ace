#ACE project boilerplate#

Please check the wiki for more information: [https://github.com/atomic-component-engine/ace/wiki](https://github.com/atomic-component-engine/ace/wiki)

##Dependencies##

- [Node JS](http://nodejs.org/) (packages listed in package.json)
- [Ruby](https://www.ruby-lang.org/), with the following gems installed:
	- [sass (you'll want the Command Line method)](http://sass-lang.com/install)
	- [sass-globbing](https://github.com/chriseppstein/sass-globbing)

##Usage##
Install the node modules by opening terminal/cmd and typing:

```> npm install```

You should now be able to run grunt to compile the project:

```> grunt dev```

This will build the project out into the dev/ folder, with uncombined, unminified JS. It will then watch the project for changes and compile upon file writes.

To build a release for testing/production (this will flatten all of the files, concat and minify everything and place them all in a directory structre that's server ready), type

```> grunt release```

Individual grunt tasks can also be run one-off if necessary:

```> grunt js```

```> grunt copy:img```


This grunt project also comes with a node server, this will [LiveReload](https://github.com/gruntjs/grunt-contrib-connect) when you save a relevant file (SASS, JS, Jade).

To run these servers just open a new terminal window and type:

```> grunt serve-dev``` This will run a dev server on http://localhost:7000/

```> grunt serve-release``` This will run a release server on http://localhost:8000/ 

