var Artist = require('../models/artist');

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