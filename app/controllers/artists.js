var Album = require('../models/album');
var Artist = require('../models/artist');
var _ = require('underscore');

exports.index = function(req, res, next) {

    var artistList = [];

    var artistStream = Artist.find().batchSize(10000).stream();
    
    artistStream.on('data', function(artist) {
        artistList.push(artist);
    });

    artistStream.on('error', function(error) {
        return next(error);
    });

    artistStream.on('close', function() {
        res.json(artistList);
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

    var genres = [];

    var genreStream = Artist.find({}, ['genre']).batchSize(10000).stream();
    
    genreStream.on('data', function(artist) {

        if (artist.genre) {
            var genre = artist.genre;
            if (genre.indexOf('/') > 0) {
                var subGenres = genre.split('/');
                for (var j = 0; j < subGenres.length; j++) {
                    var subGenre = subGenres[j];
                    genres.push(subGenre.trim());
                }
            } else {
                genres.push(artist.genre);    
            }
        }
    });

    genreStream.on('error', function(error) {
        return next(error);
    });

    genreStream.on('close', function() {
        genres = _.uniq(genres);
        genres = _.sortBy(genres, _.identity);
        res.json(genres);
    });
};