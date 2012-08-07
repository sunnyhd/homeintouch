var Episode = require('../models/episode');
var TVShow = require('../models/tvshow');

exports.index = function(req, res, next) {
    TVShow.find(function(err, shows) {
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