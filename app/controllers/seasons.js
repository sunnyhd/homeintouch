var Season = require('../models/season');
var Episode = require('../models/episode');

exports.index = function(req, res, next) {
    Season.find(function(err, seasons) {
        if (err) return next(err);
        res.json(seasons);
    });
};

exports.show = function(req, res, next) {

	var query = {
		'tvshowid' : req.params.tvshow,
		'season' : req.params.season
	};

	Season.findOne(query, function(err, season) {
		if (err) return next(err);
		if (!season) return next(new Error('No such season'));

		Episode.find(query, function(err, episodes) {
			if (err) return next(err);

			season = season.toObject();
			season.episodes = episodes;

			res.json(season);
		});
	});
	
}
