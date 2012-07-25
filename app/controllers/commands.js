var xbmc = require('../../lib/xbmc');

exports.create = function(req, res, next) {
    xbmc.rpc(req.body.method, req.body.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};