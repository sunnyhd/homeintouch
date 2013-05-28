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

exports.get = function(req, res, next) {
	Movie.findOne( { movieid: req.params.movieid }, function(err, movie) {
        if (err) return next(err);
        if (!movie) return next(new Error('No such movie'));
        res.json(movie);
    });
};

exports.lastN = function(req, res, next) {
	var movieList = [];
	var movieProperties = ['movieid', 'label', 'genre', 'thumbnailUrl'];
	var movieStream = Movie.find({}, movieProperties).sort('_id', -1).limit(req.params.n).batchSize(10000).stream();
	movieStream.on('data', function(movie) {
        movieList.push(movie);
    });

    movieStream.on('error', function(error) {
        return next(error);
    });

    movieStream.on('close', function() {
        res.json(movieList);
    });
};

var genreSplitter = ',';

exports.genres = function(req, res, next) {
    Movie.find({}, ['genre'], function(err, shows) {
	    if (err) return next(err);
	    var genres = [];

	    for (var i = 0; i < shows.length; i++) {
	    	if (shows[i].genre) {
		    	var genre = shows[i].genre;
		    	if (genre.indexOf(genreSplitter) > 0) {
		    		var subGenres = genre.split(genreSplitter);
		    		for (var j = 0; j < subGenres.length; j++) {
		    			var subGenre = subGenres[j];
		    			genres.push(subGenre.trim());
		    		}
		    	} else {
		    		genres.push(shows[i].genre);	
		    	}
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
	    	if (shows[i].year) {
		    	var year = shows[i].year.toString();
		    	if (year < 2000) {
		    		var yearPrefix = year.slice(0, (year.length - 1));
		    		year = yearPrefix + '0-' + yearPrefix + '9';
		    	}

		    	years.push(year);
	    	}
	    };

	    years = _.uniq(years);
	    years = _.sortBy(years, _.identity);
	    res.json(years);
	});
};