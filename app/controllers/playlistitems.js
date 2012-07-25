var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    var playlistid = parseInt(req.params.playlist, 10);
    
    xbmc.rpc('Playlist.GetItems', { playlistid: playlistid }, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.create = function(req, res, next) {
    var params = {
        playlistid: parseInt(req.params.playlist, 10),
        item: req.body.item
    };

    var method = 'Playlist.Add';

    if (req.body.position !== undefined) {
        method = 'Playlist.Insert';
        params.position = req.body.position;
    }
    
    xbmc.rpc(method, params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.destroy = function(req, res, next) {
    var params = {
        playlistid: parseInt(req.params.playlist, 10),
        position: parseInt(req.params.index, 10)
    };

    xbmc.rpc('Playlist.Remove', params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};