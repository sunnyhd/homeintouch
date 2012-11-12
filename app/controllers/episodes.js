var Episode = require('../models/episode');
var q = require('../../lib/queries');

exports.index = function(req, res, next) {
    Episode.find(function(err, episodes) {
        if (err) return next(err);
        res.json(episodes);
    });
};

exports.lastN = function(req, res, next) {
    q.lastN(Episode, req.params.n, function(err, episodes) {
        if (err) return next(err);
        res.json(episodes);
    });
};