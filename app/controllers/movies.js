var Movie = require('../models/movie');
var xbmc = require('../../lib/xbmc');

exports.index = function(req, res, next) {
    Movie.find(function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    });
};

exports.show = function(req, res, next) {
    Movie.findOne({ movieid: req.params.movie }, function(err, movie) {
        if (err) return next(err);
        if (!movie) return next(new Error('No such movie'));

        var params = {
            movieid: parseInt(req.params.movie, 10),
            properties: ['playcount', 'resume']
        };

        xbmc.rpc('VideoLibrary.GetMovieDetails', params, function(err, results) {
            if (err) return next(err);

            movie = movie.toObject();
            movie.playcount = results.moviedetails.playcount;
            movie.resume = results.moviedetails.resume;

            res.json(movie);
        });
    });
};