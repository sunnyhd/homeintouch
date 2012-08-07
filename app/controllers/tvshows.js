var TVShow = require('../models/tvshow');

exports.index = function(req, res, next) {
    TVShow.find(function(err, shows) {
        if (err) return next(err);
        res.json(shows);
    });
};