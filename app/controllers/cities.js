var _ = require('underscore');

var cities = require('../../lib/cities');

exports.index = function(req, res, next) {
	var term = req.query.term;

	var result = _.filter(cities, function(cityItem) {
		return (cityItem.label.indexOf(term) === 0) 
		|| (cityItem.value.indexOf(term) === 0) 
		|| (cityItem.country.indexOf(term) === 0);
	});

	res.json(result);
};