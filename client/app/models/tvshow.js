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
    },

    thumbnail: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        return data;
    },

});