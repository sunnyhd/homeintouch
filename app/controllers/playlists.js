var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};