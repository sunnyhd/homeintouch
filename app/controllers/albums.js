var Album = require('../models/album');
var Song = require('../models/song');
var q = require('../../lib/queries');
var _ = require('underscore');

exports.index = function(req, res, next) {
    Album.find(function(err, albums) {
        if (err) return next(err);
        res.json(albums);
    });
};

exports.show = function(req, res, next) {
    Album.findOne({ albumid: req.params.album }, function(err, album) {
        if (err) return next(err);
        if (!album) return next(new Error('No such album'));

        Song.find({ albumid: album.albumid }, function(err, songs) {
            if (err) return next(err);

            album = album.toObject();
            album.songs = songs;

            res.json(album);
        });
    });
};

exports.lastN = function(req, res, next) {
    q.lastN(Album, req.params.n, function(err, albums) {
        if (err) return next(err);
        res.json(albums);
    });
};

exports.genres = function(req, res, next) {
    Album.find({}, ['genre'], function(err, shows) {
        if (err) return next(err);
        var genres = [];

        for (var i = 0; i < shows.length; i++) {
            if (shows[i].genre) {
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
            }
        };

        genres = _.uniq(genres);
        genres = _.sortBy(genres, _.identity);
        res.json(genres);
    });
};

exports.years = function(req, res, next) {
    Album.find({}, ['year'], function(err, shows) {
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