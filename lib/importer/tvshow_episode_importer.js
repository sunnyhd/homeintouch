var Importer = require('./importer');
var _ = require('underscore');

var Episode = require('../../app/models/episode');

/**
 * TV Episode import configuration 
 */
var config = {
	Model: Episode,
	name: 'episode',
	idField: 'episodeid',
	list: {
		method: 'VideoLibrary.GetEpisodes',
		responseField: 'episodes'
	},
	item: {
		method: 'VideoLibrary.GetEpisodeDetails',
		responseField: 'episodedetails',
		properties: ['plot', 'rating', 'episode', 'firstaired', 'playcount', 'thumbnail', 
					 'resume', 'season', 'tvshowid', 'showtitle', 'file']
	}
};

/**
 * Episode Impoter.
 * It extends the Importer to modify some of the process behavior
 */
var EpisodeImporter = Importer.extend({
	init: function(config) {
		this._super(config);
	},

	/**
	 * The tvshow and season ids parameters used when retrieving the episode list should be directly
	 * on the "params" attribute and NOT inside a "filter" attribute.
	 */
	addFilterParameters: function(params, filter) {
		return _.extend(params, filter);
	}
});

// Creates the importer instance with the appropriate configuration
module.exports = new EpisodeImporter(config);