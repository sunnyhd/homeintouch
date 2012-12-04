var xbmc = require('../../lib/xbmc');

exports.show = function(req, res, next) {
    var params = {
        properties: ['muted', 'volume']
    };

    xbmc.rpc('Application.GetProperties', params, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};