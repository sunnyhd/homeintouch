var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    var playlistid = parseInt(req.params.playlist, 10);
    
    xbmc.rpc('Playlist.GetItems', { playlistid: playlistid, properties: ['file'] }, function(err, results) {
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

exports.swap = function(req, res, next) {
    var params = {
        playlistid: parseInt(req.params.playlist, 10),
        position1: parseInt(req.params.index, 10),
        position2: req.body.newPosition
    };

    var method = 'Playlist.Swap';

    xbmc.rpc(method, params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.remove = function(req, res, next) {
    var params = {
        playlistid: parseInt(req.params.playlist, 10),
        position: parseInt(req.params.index, 10)
    };

    xbmc.rpc('Playlist.Remove', params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};