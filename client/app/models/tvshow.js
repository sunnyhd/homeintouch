var Seasons = require('collections/seasons');

module.exports = Backbone.Model.extend({

    idAttribute: 'tvshowid',

    urlRoot: '/api/tvshows',

    initialize: function() {
        this.seasons = new Seasons();
    },

    parse: function(res) {
        this.seasons || (this.seasons = new Seasons());
        this.seasons.reset(res.seasons);
        delete res.seasons;
        return res;
    },

    thumbnail: function() {
        return this.get('thumbnailUrl');
    },

    fanartImage: function() {
        return this.get('fanartUrl');
    },

    banner: function() {
        return this.get('bannerUrl');
    },    

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.banner = this.banner();
        data.fanartImage = this.fanartImage();
        return data;
    }

});