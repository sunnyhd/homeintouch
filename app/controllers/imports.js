var importer = require('../../lib/importer');

exports.create = function(req, res, next) {
    importer.start();
    res.json({ state: importer.state });
};

exports.show = function(req, res, next) {
    res.json({ state: importer.state });
};

// Forces the media data update on the clients
exports.refresh = function(req, res, next) {
    res.json( { state: 'Updating media data on clients' } );
    importer.emit('done', Date.now());
};