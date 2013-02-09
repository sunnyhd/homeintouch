var async = require('async');
var dataStore = require('../../lib/dataStore');
var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
        if (err) return callback(err);
        var players = {};

        results.forEach(function(playlist) {
            players[playlist.type] = playlist.playlistid;
        });

        res.render('index', {
            data: dataStore.getAll(),
            players: players
        });
    });
};