var Importer = require('./importer');
var Promise = require('../promise');
var _ = require('underscore');
var episodeImporter = require('./tvshow_episode_importer')

var Season = require('../../app/models/season');

/**
 * TV Show Season import configuration -> It calls the Episode Importer
 */
var config = {
	Model: Season,
	name: 'Season',
	idField: 'season',
	subImporter: episodeImporter,
	list: {
		method: 'VideoLibrary.GetSeasons',
		responseField: 'seasons',
		properties: ['fanart', 'watchedepisodes', 'episode', 'season', 'tvshowid', 'showtitle', 'art', 'thumbnail']
	}
};

/**
 * Season Impoter.
 * It extends the Importer to modify some of the process behavior
 */
var SeasonImporter = Importer.extend({
	init: function(config) {
		this._super(config);
	},

	/**
	 * The tvshow id parameter used when retrieving the seasons list should be directly
	 * on the "params" attribute and NOT inside a "filter" attribute.
	 */
	addFilterParameters: function(params, filter) {
		return _.extend(params, filter);
	},

	/**
	 * Overriden because the season needs to pass to the episode importer, 
	 * not only the season id but also the tvshow id.
	 */
	buildFilterForChildren: function(item) {
		var filter = {};
		filter.tvshowid = item.tvshowid;
		filter.season = this.id(item);
		return filter;
	},

	/**
	 * There is no 'GetSeasonDetails' method, so all the info required is retrieved when the list
	 * of seasons is retrieved. So, when this method is called, it just returns
	 * a resolved promise with the passed item (which already contains all the info).
	 */
	loadItemDetails: function(item) {
		return Promise.resolve(item);
	}
});

// Creates the importer instance with the appropriate configuration
module.exports = new SeasonImporter(config);