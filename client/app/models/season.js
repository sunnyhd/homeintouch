var Episodes = require('collections/episodes');

module.exports = Backbone.Model.extend({

    idAttribute: '_id',

    url: function() {
        return '/api/seasons/' + this.get('tvshowid') + '/' + this.get('season');
    },

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
        return this.get('thumbnailUrl')
    },

    fanartImage: function() {
        return this.get('fanartUrl')
    },

    banner: function() {
        return this.get('bannerUrl')
    },    

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.banner = this.banner();
        data.fanartImage = this.fanartImage();
        return data;
    }

});