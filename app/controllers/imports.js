var mediaManager = require('../../lib/media_manager');

exports.create = function(req, res, next) {
    mediaManager.import();
    res.json({ state: 'importing...' });
};

exports.show = function(req, res, next) {
    res.json({ state: importer.state });
};

// Forces the media data update on the clients
exports.refresh = function(req, res, next) {
    res.json( { state: 'Updating media data on clients' } );
    importer.emit('done', Date.now());
};