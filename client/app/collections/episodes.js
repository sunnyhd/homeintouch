var Episode = require('models/episode');

module.exports = Backbone.Collection.extend({

    model: Episode,

    url: '/api/episodes',

    comparator: function(episode) {
        return [
            episode.get('showtitle'),
            episode.get('season'),
            episode.get('episode')
        ].join(' - ');
    }

});