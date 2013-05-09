var async = require('async');
var dataStore = require('../../lib/dataStore');
var xbmc = require('../../lib/xbmc');

var settings = require('../../config');

exports.index = function(req, res, next) {

    // Set client configuration
    var configData = settings.client;

    xbmc.rpc('Playlist.GetPlaylists', function(err, results) {

        var players = {};
        if (!err) {
            console.log(JSON.stringify(results));
            results.forEach(function(playlist) {
                players[playlist.type] = playlist.playlistid;
            });
        }

        var resultData = dataStore.getAll();
        resultData.config = configData;

        res.render('index', {
            data: resultData,
            players: (results ? results : [])
        });
    });
};