var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    xbmc.rpc('Player.GetActivePlayers', {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.create = function(req, res, next) {
    var params = req.body || {};

    if (params.item) {

        if (params.item.path) {

            var urlPattern = /^(\/\w+\:\/{1,2}).*/;

            if (params.item.path.match(urlPattern)) {
                params.item.path = params.item.path.substr(1);
            }
        }
    }

    xbmc.rpc('Player.Open', params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.show = function(req, res, next) {
    var playerid = parseInt(req.params.player, 10);
    var params = {
        playerid: playerid,
        properties: ['file']
    };

    xbmc.rpc('Player.GetItem', params, function(err, results) {
        if (err) return next(err);

        params.properties = ['time', 'percentage', 'totaltime', 'repeat', 'shuffled', 'playlistid', 'speed', 'type'];

        xbmc.rpc('Player.GetProperties', params, function(err, properties) {
            if (err) return next(err);

            results.playerid = playerid;
            for (var key in properties) {
                results[key] = properties[key];
            }

            res.json(results);
        })
    });
};

exports.destroy = function(req, res, next) {
    var params = { playerid: parseInt(req.params.player, 10) };

    xbmc.rpc('Player.Stop', params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};