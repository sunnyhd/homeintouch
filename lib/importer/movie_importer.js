var Importer = require('./importer');

var Movie = require('../../app/models/movie');

/**
 * Movie import configuration 
 */
var config = {
	Model: Movie,
	name: 'movie',
	idField: 'movieid',
	list: {
		method: 'VideoLibrary.GetMovies',
		responseField: 'movies'
	},
	item: {
		method: 'VideoLibrary.GetMovieDetails',
		responseField: 'moviedetails',
		properties: ['thumbnail', 'genre', 'mpaa', 'rating', 'runtime',
                'year', 'file', 'studio', 'director', 'plot', 'votes',
                'fanart', 'imdbnumber', 'trailer', 'playcount', 'resume'] 
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);