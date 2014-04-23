/**
 * @file Tests Browser Capabilities and Loads Polyfills if required
 */
(function(){
baseUrl = typeof Drupal != 'undefined' ? Drupal.settings.basePath + 'js' : 'js';
  define([
    "modernizr",
    ], Modernizr);

Modernizr.load({
  test: Modernizr.input.placeholder,
  nope : baseUrl + '/vendor/modernizr/polyfills/simple-placeholder.js',
});
})();
