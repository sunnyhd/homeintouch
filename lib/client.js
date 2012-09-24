var fs = require('fs');
var path = require('path');
var stitch = require('stitch');

var root = path.dirname(__dirname);
var client = path.join(root, 'client');

// Handlebars
// ---------------

stitch.compilers.handlebars = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8').replace(/\n/g, '');
    var text = 'module.exports = Handlebars.compile(' + JSON.stringify(content) + ')';
    module._compile(text, filename);
};

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
        client + '/vendor/socket.io.js',
        client + '/vendor/handlebars.js',
        client + '/vendor/tinyscroll.js',
        client + '/vendor/gridster.js'
    ]
});