var Importer = require('./importer');

var Movie = require('../../app/models/movie');

/**
 * Movie import configuration 
 */
var config = {
	Model: Movie,
	name: 'movie',
	idField: 'movieid',
	properties: ['thumbnail', 'genre', 'mpaa', 'rating', 'runtime',
            'year', 'file', 'studio', 'director', 'plot', 'votes',
            'fanart', 'imdbnumber', 'trailer', 'playcount', 'resume'], 
	list: {
		method: 'VideoLibrary.GetMovies',
		responseField: 'movies',
		pageSize: 20
	},
	item: {
		method: 'VideoLibrary.GetMovieDetails',
		responseField: 'moviedetails'
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);