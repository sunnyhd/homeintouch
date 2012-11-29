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
        client + '/vendor/compiled-svg-icons.js',
        client + '/vendor/jquery.js',
        client + '/vendor/jquery-ui-1.9.0.custom.min.js',
        client + '/vendor/jquery.ui.touch-punch.min.js',
        client + '/vendor/underscore.js',
        client + '/vendor/backbone.js',
        client + '/vendor/backbone.marionette.js',
        client + '/vendor/backbone.formhelpers.js',
        client + '/vendor/backbone.ponzi.js',
        client + '/vendor/bootstrap.2.0.4.min.js',
        client + '/vendor/socket.io.js',
        client + '/vendor/handlebars.js',
        client + '/vendor/tinyscroll.js',
        client + '/vendor/less-1.3.1.min.js',
        client + '/vendor/jquery.jdigiclock.js',
        client + '/vendor/video.min.js'
    ]
});