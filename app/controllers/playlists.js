var xbmc = require('../../lib/xbmc');
var Promise = require('../../lib/promise');

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
		// Stop the player after clearing the playlist		
		return Promise.asPromise(xbmc, xbmc.rpc, 'Player.Stop', { playerid: playlistid })
		
	})
	.then(function(results) {
		res.json(results);
	})
	.fail(function(err) {
		return next(err);
	})
	.done();
};

	
