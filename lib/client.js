var fs = require('fs');
var path = require('path');
var stitch = require('stitch');
var compressor = require('node-minify');

var root = path.dirname(__dirname);
var client = path.join(root, 'client');
var cssLibraryPath = path.join(root, 'public/css/lib');

var settings = require('../config');

var removeFile = function(filePath) {
    var fileExists = fs.existsSync(filePath);
    if (fileExists) {
        fs.unlinkSync(filePath);
    }
};

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
        client + '/vendor/jquery.jdigiclock.js',
        client + '/vendor/q.min.js'
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
        client + '/vendor/jquery.jdigiclock.js',
        client + '/vendor/q.min.js'
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

exports.buildCssLibrary = function() {

    var libraryFiles = [
        cssLibraryPath + '/bootstrap.2.0.4.css', 
        cssLibraryPath + '/bootstrap-responsive.2.0.4.css', 
        cssLibraryPath + '/scrollbar.css', 
        cssLibraryPath + '/jquery-ui-1.8.17.custom.css', 
        cssLibraryPath + '/jquery.jdigiclock.css'
    ];

    var compressType = (settings.client.minifyCssLibrary) ? 'sqwish' : 'no-compress';
    var cssFileOut = (settings.client.minifyCssLibrary) ? 'public/css/hit-library.min.css' : 'public/css/hit-library.css';

    // Only concatenation of files (no compression)
    new compressor.minify({
        type: compressType,
        fileIn: libraryFiles,
        fileOut: cssFileOut,
        callback: function(err){
            if (err) throw err; 
            console.log('CSS Library built');
        }
    });
};

exports.compileLess = function() {
    // Compile less files into one css file
    var compiledStylePath = './public/css/hit-compiled.css';
    removeFile(compiledStylePath);

    var cssc = require('css-condense');

    var less = require('less');
    var parser = new(less.Parser)({
        paths: ['./public/css'],
        filename: 'hit.less'
    });

    fs.readFile('./public/css/hit.less', function(error, data) {
        if (error) throw error;
        data = data.toString();
        parser.parse(data, function (e, tree) {
            fs.writeFile(compiledStylePath, cssc.compress(tree.toCSS({ compress: true }), {safe: true}), function(err){
                if (err) throw err;
                console.log('LESS compilation done.');
            });
        });
    });
};

exports.minifyJS = function() {
    var clientPath = './public/application.js';
    var minClientPath = './public/application-min.js';
    removeFile(clientPath);

    exports.assets.compile(function (err, source) {
        fs.writeFile(clientPath, source, function (err) {
            if (err) throw err;
            console.log('Compiled application.js');

            removeFile(minClientPath);

            new compressor.minify({
                type: 'uglifyjs',
                fileIn: clientPath,
                fileOut: minClientPath,
                callback: function(err){
                    if (err) throw err; 
                    console.log('Application file minified');
                }
            });
        });
    });
};