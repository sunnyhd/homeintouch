var Album = require('../models/album');
var Artist = require('../models/artist');
var _ = require('underscore');

exports.index = function(req, res, next) {
    Artist.find(function(err, artists) {
        if (err) return next(err);
        res.json(artists);
    });
};

exports.show = function(req, res, next) {
    Artist.findOne({ artistid: req.params.artist }, function(err, artist) {
        if (err) return next(err);
        if (!artist) return next(new Error('No such artist'));

        Album.find({ artistid: artist.artistid }, function(err, albums) {
            if (err) return next(err);

            artist = artist.toObject();
            artist.albums = albums;

            res.json(artist);
        });
    });
};

exports.genres = function(req, res, next) {
    Artist.find({}, ['genre'], function(err, shows) {
        if (err) return next(err);
        var genres = [];

        for (var i = 0; i < shows.length; i++) {
            if (shows[i].genre) {
                var genre = shows[i].genre;
                if (genre.indexOf(',') > 0) {
                    var subGenres = genre.split(',');
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