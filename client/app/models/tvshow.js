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
        return data;
    }

});