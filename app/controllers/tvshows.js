var Episode = require('../models/episode');
var TVShow = require('../models/tvshow');
var _ = require('underscore');

exports.index = function(req, res, next) {
    TVShow.find(req.query, function(err, shows) {
        if (err) return next(err);
        res.json(shows);
    });
};

exports.show = function(req, res, next) {
    TVShow.findOne({ tvshowid: req.params.tvshow }, function(err, show) {
        if (err) return next(err);
        if (!show) return next(new Error('No such show'));

        Episode.find({ tvshowid: show.tvshowid }, function(err, episodes) {
            if (err) return next(err);

            show = show.toObject();
            show.episodes = episodes;

            res.json(show);
        });
    });
};

exports.genres = function(req, res, next) {
    TVShow.find({}, ['genre'], function(err, shows) {
        if (err) return next(err);
        var genres = [];

        for (var i = 0; i < shows.length; i++) {
            genres.push(shows[i].genre);
        };

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