var Episode = require('../models/episode');
var TVShow = require('../models/tvshow');
var Season = require('../models/season');
var _ = require('underscore');

exports.index = function(req, res, next) {

    var queryCallback = function(err, shows) {
        if (err) return next(err);
        res.json(shows);
    };

    if (req.query.genre) {
        TVShow.find().where('genre').regex(req.query.genre).exec(queryCallback);
    } else {
        TVShow.find(req.query, queryCallback);
    }
};

exports.show = function(req, res, next) {
    TVShow.findOne({ tvshowid: req.params.tvshow }, function(err, show) {
        if (err) return next(err);
        if (!show) return next(new Error('No such show'));

        Season.find({ tvshowid: show.tvshowid }, function(err, seasons) {
            if (err) return next(err);

            show = show.toObject();
            show.seasons = seasons;

            res.json(show);
        });
    });
};

var genresSplitter = ',';

exports.genres = function(req, res, next) {
    TVShow.find({}, ['genre'], function(err, shows) {
        if (err) return next(err);
        var genres = [];

        for (var i = 0; i < shows.length; i++) {
            if (shows[i].genre) {
                var genre = shows[i].genre;
                if (genre.indexOf(genresSplitter) > 0) {
                    var subGenres = genre.split(genresSplitter);
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

exports.saveAll = function(req, res, next) {
  TVShow.find(req.query, function(err, shows) {
        if (err) return next(err);
        _.each(shows, function(show){
            show.save();
        });
        res.json('{ok: true}');
    });  
}