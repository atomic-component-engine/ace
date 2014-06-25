/**
 * @file Provides the help message
 * @author Tom Jenkins tom@itsravenous.com
 */

var chalk = require('chalk');

module.exports = function () {

	console.log('\n');
	console.log(chalk.green('Welcome to the Atomic Component Engine (ACE):'))
	console.log('\n');
	console.log(chalk.yellow('yo ace'), '				Add the initial boilerplate to your current directory.');
	console.log(chalk.yellow('yo ace:component'), '		Create a component.');
	console.log(chalk.yellow('yo ace:component [type] [name]'), '	Create a component (non-interactive)');
	console.log(chalk.yellow('yo ace:add-dependency'), '		Add a dependency to a component.');
	console.log(chalk.yellow('yo ace:export'), '			Export a component and its dependencies as a zip archive.');
	console.log('\n');

}