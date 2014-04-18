requirejs.config({
	"baseUrl": "js",
	
	"paths": {
		"base":			"vendor/Base",
		"jquery":		"vendor/jquery",
		"text":			"vendor/text",
		"templates":	"../templates"
	},
	
	"shim": {
  
		"jquery": {
			"exports": "$"
		}
  
	},
	
	"name": "main",
	"include": "vendor/almond",
	"wrap": true
	
});
