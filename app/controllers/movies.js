var Movie = require('../models/movie');
var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    Movie.find(function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    });
};