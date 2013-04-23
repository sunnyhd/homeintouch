var Episode = require('../models/episode');
var q = require('../../lib/queries');
var _ = require('underscore');

exports.index = function(req, res, next) {
    Episode.find(function(err, episodes) {
        if (err) return next(err);
        res.json(episodes);
    });
};

exports.get = function(req, res, next) {
    Episode.findOne( { episodeid: req.params.episodeid }, function(err, ep) {
        if (err) return next(err);
        if (!ep) return next(new Error('No such episode'));
        res.json(ep);
    });
};

exports.label = function(req, res, next) {
	Episode.find({}, ['label', 'tvshowid'], function(err, episodes) {
        if (err) return next(err);
        var result = _.groupBy(episodes, "tvshowid");
        res.json(result);
    });	
};

exports.lastN = function(req, res, next) {
    q.lastN(Episode, req.params.n, function(err, episodes) {
        if (err) return next(err);
        res.json(episodes);
    });
};