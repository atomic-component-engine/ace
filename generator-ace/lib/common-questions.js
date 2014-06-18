/**
* @file Provides an object containing common questions used by the component generators
* @author Tom Jenkins tom@itsravenous.com
*/
var questions = {
	componentType: {
		type: 'list',
		name: 'componentType',
		message: 'What type would you like to generate?',
		choices: [
		'Atom',
		'Molecule',
		'Organism',
		'Template'
		],
		filter: function( val ) { return val.toLowerCase(); }
	},
	componentName: {
		type: 'item',
		name: 'componentName',
		message: 'What would you like to call the component?'
	},
	userName: {
		type: 'item',
		name: 'userName',
		message: 'What is your name?'
	},
	userEmail: {
		type: 'item',
		name: 'userEmail',
		message: 'What is your email address?'
	}
}

module.exports = questions;