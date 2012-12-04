var Song = require('../models/song');

exports.index = function(req, res, next) {
    Song.find(function(err, songs) {
        if (err) return next(err);
        res.json(songs);
    });
};