var Episode = require('../models/episode');

exports.index = function(req, res, next) {
    Episode.find(function(err, episodes) {
        if (err) return next(err);
        res.json(episodes);
    });
};