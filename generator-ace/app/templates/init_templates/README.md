#Front-end project boilerplate#

## ACE Config
The ACE config file powers a few user config settings. Firstly it contains an option for the baseUrl that gets passed to your Jade Templates. This option is for absolute URL's. Which are needed due to the folder structure. 

##Dependencies##

- [Node JS](http://nodejs.org/) (packages listed in package.json)
- [Ruby](https://www.ruby-lang.org/), with the following gems installed:
	- sass
	- sass-globbing
	- compass

##Usage##
Install the node modules:

```> npm install```

You should now be able to run grunt to compile the project:

```> grunt dev```

This will build the project out into the dev/ folder, with uncombined, unminified JS. It will then watch the project for changes and compile upon file writes.

To build a release for testing/production, type

```> grunt release```

Individual grunt tasks can also be run one-off if necessary:

```> grunt js```

```> grunt copy:img```
