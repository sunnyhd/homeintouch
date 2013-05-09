var Importer = require('./importer');
var seasonImporter = require('./tvshow_season_importer')

var TVShow = require('../../app/models/tvshow');

/**
 * TV Show import configuration -> It calls the Season Importer 
 */
var config = {
	Model: TVShow,
	name: 'TV show',
	idField: 'tvshowid',
	subImporter: seasonImporter,
	list: {
		method: 'VideoLibrary.GetTVShows',
		responseField: 'tvshows'
	},
	item: {
		method: 'VideoLibrary.GetTVShowDetails',
		responseField: 'tvshowdetails',
		properties: ['year', 'rating', 'thumbnail', 'genre', 'studio', 'plot', 'mpaa', 
					 'votes', 'cast', 'premiered', 'fanart', 'art']
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);