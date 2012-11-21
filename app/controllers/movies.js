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
	} else if (req.query.year) {
		var year = req.query.year;
		if (year.indexOf('-') > 0) {
			var yearArray = year.split('-');
			Movie.find().where('year').gte(yearArray[0]).lte(yearArray[1]).exec(queryCallback);
		} else {
			Movie.find().where('year').equals(req.query.year).exec(queryCallback);	
		}
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
	    genres = _.sortBy(genres, _.identity);
	    res.json(genres);
	});
};

exports.years = function(req, res, next) {
    Movie.find({}, ['year'], function(err, shows) {
	    if (err) return next(err);
	    var years = [];

	    for (var i = 0; i < shows.length; i++) {
	    	var year = shows[i].year.toString();
	    	if (year < 2000) {
	    		var yearPrefix = year.slice(0, (year.length - 1));
	    		year = yearPrefix + '0-' + yearPrefix + '9';
	    	}

	    	years.push(year);
	    };

	    years = _.uniq(years);
	    years = _.sortBy(years, _.identity);
	    res.json(years);
	});
};