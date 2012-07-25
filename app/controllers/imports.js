var importer = require('../../lib/importer');

exports.create = function(req, res, next) {
    importer.start();
    res.json({ state: importer.state });
};

exports.show = function(req, res, next) {
    res.json({ state: importer.state });
};