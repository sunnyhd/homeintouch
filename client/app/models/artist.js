var Albums = require('collections/albums');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'artistid',

    urlRoot: '/api/artists',

    initialize: function() {
        this.albums = new Albums();
    },

    thumbnail: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    fanart: function() {
        var id = this.get('fanartid');

        if (id) {
            return '/api/images/' + this.get('fanartid');
        }
    },

    parse: function(res) {
        this.albums || (this.albums = new Albums());
        this.albums.reset(res.albums);
        delete res.albums;
        return res;
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.fanart = this.fanart();
        return data;
    }

});