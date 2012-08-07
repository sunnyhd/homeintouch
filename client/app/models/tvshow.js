var Episodes = require('collections/episodes');

module.exports = Backbone.Model.extend({

    idAttribute: 'tvshowid',

    urlRoot: '/api/tvshows',

    initialize: function() {
        this.episodes = new Episodes();
    },

    parse: function(res) {
        this.episodes || (this.episodes = new Episodes());
        this.episodes.reset(res.episodes);
        delete res.episodes;
        return res;
    }

});