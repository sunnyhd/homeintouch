var async = require('async');
var dataStore = require('../../lib/dataStore');
var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    var funcs = {
        players: function(callback) {
            xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
                if (err) return callback(err);
                var players = {};

                results.forEach(function(playlist) {
                    players[playlist.type] = playlist.playlistid;
                });

                callback(null, players);
            });
        }
    };

    async.parallel(funcs, function(err, results) {
        if (err) return next(err);

        res.render('index', {
            data: dataStore.getAll(),
            players: results.players
        });
    });
};