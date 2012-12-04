var Episode = require('models/episode');

module.exports = Backbone.Collection.extend({

    model: Episode,

    url: '/api/episodes',

    initialize: function(opts) {
    	opts || (opts = {});
    	if (opts.lastN) {
    		this.url = '/api/episodes/last/' + opts.lastN;
    	}
    },

    comparator: function(episode) {

        return [
            episode.get('showtitle'),
            episode.get('season'),
            episode.getEpisodeNumber()
        ].join(' - ');
    }

});