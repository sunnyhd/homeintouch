var fs = require('fs');
var path = require('path');
var stitch = require('stitch');

var root = path.dirname(__dirname);
var client = path.join(root, 'client');

var settings = require('../config');

var clientDependencies = [];
if (settings.client.minify) {
    clientDependencies = [
        client + '/vendor/compiled-svg-icons.js',
        client + '/vendor/jquery-1.7.2.min.js',
        client + '/vendor/jquery-ui-1.9.0.custom.min.js',
        client + '/vendor/jquery.ui.touch-punch.min.js',
        client + '/vendor/jquery.dotdotdot-1.5.7.min.js',
        client + '/vendor/underscore-1.3.3.min.js',
        client + '/vendor/underscore.string-2.3.0.min.js',
        client + '/vendor/backbone-0.9.2.min.js',
        client + '/vendor/backbone.marionette-0.7.0.min.js',
        client + '/vendor/backbone.formhelpers.js',
        client + '/vendor/backbone.ponzi.js',
        client + '/vendor/bootstrap.2.0.4.min.js',
        client + '/vendor/socket.io.js',
        client + '/vendor/handlebars.js',
        client + '/vendor/tinyscroll.min.js',
        client + '/vendor/less-1.3.1.min.js',
        client + '/vendor/jquery.jdigiclock.js'
    ];
} else {
    clientDependencies = [
        client + '/vendor/compiled-svg-icons.js',
        client + '/vendor/jquery-1.7.2.js',
        client + '/vendor/jquery-ui-1.9.0.custom.js',
        client + '/vendor/jquery.ui.touch-punch.js',
        client + '/vendor/jquery.dotdotdot-1.5.7.js',
        client + '/vendor/underscore-1.3.3.js',
        client + '/vendor/underscore.string-2.3.0.js',
        client + '/vendor/backbone-0.9.2.js',
        client + '/vendor/backbone.marionette-0.7.0.js',
        client + '/vendor/backbone.formhelpers.js',
        client + '/vendor/backbone.ponzi.js',
        client + '/vendor/bootstrap.2.0.4.js',
        client + '/vendor/socket.io.js',
        client + '/vendor/handlebars.js',
        client + '/vendor/tinyscroll.js',
        client + '/vendor/less-1.3.1.min.js',
        client + '/vendor/jquery.jdigiclock.js'
    ];
}

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
    dependencies: clientDependencies
});