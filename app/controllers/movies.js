var Movie = require('../models/movie');
var q = require('../../lib/queries');

exports.index = function(req, res, next) {
    Movie.find(function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    });
};

exports.lastN = function(req, res, next) {
	q.lastN(Movie, req.params.n, function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    });
};