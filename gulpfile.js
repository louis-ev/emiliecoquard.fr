// For all available options, see node_modules/pho-devstack/config.js
// These are development build settings, see gulpfile-production.js for production settings

var gulp = require('gulp');
var extend = require('node.extend');
var substituteConfig = require('./substitute-config');

var pho = require('pho-devstack')(gulp, {
  browserify: {
    debug: false,
    transforms: {
      "browserify-ngmin": true,
      uglifyify: true
    }
  },
  imagemin: {
    enabled: false
  },
  substituter: extend(true, substituteConfig, {
    // cdn: '/', // uncomment if you are using absolute paths
    livereload: function() {
      return "<script>document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1\"></' + 'script>')</script>";
    }
  }),
  newer: {
    /* Process all files */
    enabled: false
  },
  htmlmin: {
    /* Markup minification */
    /* Option list: https://github.com/kangax/html-minifier#options-quick-reference */
    enabled: false
  },
  copy: [ 'scripts/main.js', 'scripts/_plugins.js', 'scripts/vendor/jquery-1.11.0.min.js', 'font/*']

//   copy: [ '*.php', 'scripts/main.js', 'scripts/_plugins.js', 'templates-parts/*', 'projets-contents/*', 'scripts/vendor/jquery-1.11.0.min.js']
});

// If needed, redefine tasks here

