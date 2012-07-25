var Album = require('../models/album');
var Song = require('../models/song');

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