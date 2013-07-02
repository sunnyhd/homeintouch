var Importer = require('./importer');
var Promise = require('../promise');
var seasonImporter = require('./tvshow_season_importer');
var episodeImporter = require('./tvshow_episode_importer');

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

	/**
	 * Overrides the default processItem in order to process the show's Seasons as well
	 * because seasons can only be retrieved using the tvshowid (episodes dont have this requirement)
	 */
	processItem: function(item) {
		var self = this;
		return this._super(item)
			.then(function(item) {
				return self.processChildren(item)
					.then(function() {
						return item;
					});
			});
	},

	/**
 	 * Override to call 2 subimporters
 	 */
	processChildren: function(item) {
		// Call the subimporter "import" method with the appropriate filter
		console.log('Importing seasons and episodes for ' + this.itemToString(item));
		var filter = this.buildFilterForChildren(item);
		return Promise.all([seasonImporter.import(filter), episodeImporter.import(filter)]);	
	}
});

// Creates the importer instance with the appropriate configuration
module.exports = new TVShowImporter(config);