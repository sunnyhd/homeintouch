var Seasons = require('collections/seasons');

module.exports = Backbone.Model.extend({

    idAttribute: 'tvshowid',

    urlRoot: '/api/tvshows',

    defaults: {
        type: 'tvshow'
    },

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
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    getType: function() {
        return this.get('type');
    },

    fanartImage: function() {
        var id = this.get('fanartid');

        if (id) {
            return '/api/images/' + this.get('fanartid');
        }
    },

    banner: function() {
        var id = this.get('bannerid');

        if (id) {
            return '/api/images/' + this.get('bannerid');
        }
    },    

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.banner = this.banner();
        data.fanartImage = this.fanartImage();
        data.label = this.get('label');
        return data;
    }

});