var Movie = require('../models/movie');
var q = require('../../lib/queries');
var _ = require('underscore');

exports.index = function(req, res, next) {
	var queryCallback = function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    };

	if (req.query.genre) {
		Movie.find().where('genre').regex(req.query.genre).exec(queryCallback);
	} else {
		Movie.find(req.query, queryCallback);
	}
};

exports.lastN = function(req, res, next) {
	q.lastN(Movie, req.params.n, function(err, movies) {
        if (err) return next(err);
        res.json(movies);
    });
};

exports.genres = function(req, res, next) {
    Movie.find({}, ['genre'], function(err, shows) {
	    if (err) return next(err);
	    var genres = [];

	    for (var i = 0; i < shows.length; i++) {
	    	var genre = shows[i].genre;
	    	if (genre.indexOf('/') > 0) {
	    		var subGenres = genre.split('/');
	    		for (var j = 0; j < subGenres.length; j++) {
	    			var subGenre = subGenres[j];
	    			genres.push(subGenre.trim());
	    		}
	    	} else {
	    		genres.push(shows[i].genre);	
	    	}
	    };

	    genres = _.uniq(genres);
	    res.json(genres);
	});
};