var fs = require('fs');
var path = require('path');
var stitch = require('stitch');

var root = path.dirname(__dirname);
var client = path.join(root, 'client');

// Assets
// ---------------

exports.assets = stitch.createPackage({
    paths: [client + '/app'],
    
    dependencies: [
        client + '/vendor/jquery.js',
        client + '/vendor/underscore.js',
        client + '/vendor/backbone.js',
        client + '/vendor/backbone.marionette.js',
        client + '/vendor/backbone.formhelpers.js',
        client + '/vendor/backbone.ponzi.js',
        client + '/vendor/bootstrap.js',
        client + '/vendor/socket.io.js'
    ]
});