var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.clear = function(req, res, next) {
    var playlistid = parseInt(req.params.playlist, 10);

	Promise.asPromise(xbmc, xbmc.rpc, 'Playlist.Clear', { playlistid: playlistid })
	.then(function(results) {
		res.json(results);
	})
	.fail(function(err) {
		return next(err);
	})
	.done();
};

	
