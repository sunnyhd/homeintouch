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
	properties: ['year', 'rating', 'thumbnail', 'genre', 'studio', 'plot', 'mpaa', 
				 'votes', 'cast', 'premiered', 'fanart', 'art'],
	list: {
		method: 'VideoLibrary.GetTVShows',
		responseField: 'tvshows'
	},
	item: {
		method: 'VideoLibrary.GetTVShowDetails',
		responseField: 'tvshowdetails'
	}
};

// Creates the importer instance with the appropriate configuration
var TVShowImporter = Importer.extend({
	init: function(config) {
		this._super(config);
	},

	processItem: function(item) {
		var self = this;
		return this._super(item).then(function(item) {
			return self.processChildren(item)
				.then(function() {
					return item;
				});
		});
	}
});

// Creates the importer instance with the appropriate configuration
module.exports = new TVShowImporter(config);