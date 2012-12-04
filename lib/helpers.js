var fs = require('fs');
var path = require('path');

exports.autoload = function(dir) {
    var modules = {};

    fs.readdirSync(dir).forEach(function(file) {
        var name = file.split('.')[0];
        modules[name] = require(path.join(dir, file));
    });

    return modules;
};