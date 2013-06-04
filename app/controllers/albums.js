var Album = require('../models/album');
var Song = require('../models/song');
var q = require('../../lib/queries');
var _ = require('underscore');

exports.index = function(req, res, next) {

    var albumList = [];

    var albumStream = Album.find().batchSize(10000).stream();
    
    albumStream.on('data', function(album) {
        albumList.push(album);
    });

    albumStream.on('error', function(error) {
        return next(error);
    });

    albumStream.on('close', function() {
        res.json(albumList);
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
    var albumList = [];
    var albumProperties = ['albumid', 'artist', 'thumbnailUrl', 'label'];
    var albumStream = Album.find({}, albumProperties).sort('_id', -1).limit(req.params.n).batchSize(10000).stream();
    albumStream.on('data', function(album) {
        albumList.push(album);
    });

    albumStream.on('error', function(error) {
        return next(error);
    });

    albumStream.on('close', function() {
        res.json(albumList);
    });
};

exports.genres = function(req, res, next) {

    var genres = [];

    var genreStream = Album.find({}, ['genre']).batchSize(10000).stream();
    
    genreStream.on('data', function(album) {

        if (album.genre) {
            var genre = album.genre;
            if (genre.indexOf('/') > 0) {
                var subGenres = genre.split('/');
                for (var j = 0; j < subGenres.length; j++) {
                    var subGenre = subGenres[j];
                    genres.push(subGenre.trim());
                }
            } else {
                genres.push(album.genre);    
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

exports.years = function(req, res, next) {

    var years = [];

    var yearStream = Album.find({}, ['year']).batchSize(10000).stream();

    yearStream.on('data', function(album) {
        if (album.year) {
            var year = album.year.toString();
            if (year < 2000) {
                var yearPrefix = year.slice(0, (year.length - 1));
                year = yearPrefix + '0-' + yearPrefix + '9';
            }

            years.push(year);
        }
    });

    yearStream.on('error', function(error) {
        return next(error);
    });

    yearStream.on('close', function() {
        years = _.uniq(years);
        years = _.sortBy(years, _.identity);
        res.json(years);
    });
};

exports.getByArtist = function(req, res, next) {

    Album.find({ artistid: req.params.artistid }, function(err, albums) {
        if (err) return next(err);

        res.json(albums);
    });
};