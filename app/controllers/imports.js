var mediaManager = require('../../lib/media_manager');

exports.create = function(req, res, next) {
	var importMedia = req.params.media;
	if (importMedia) {
	    mediaManager.import(importMedia);
	    res.json({ state: 'importing...' });
	} else {
		res.json({ message: 'You must define a media to import.'});
	}
};

exports.show = function(req, res, next) {
    res.json({ state: mediaManager.state });
};

// Forces the media data update on the clients
exports.refresh = function(req, res, next) {
    res.json( { state: 'Updating media data on clients' } );
    mediaManager.emit('done', Date.now());
};