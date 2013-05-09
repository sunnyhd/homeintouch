var Albums = require('collections/albums');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'artistid',

    urlRoot: '/api/artists',

    initialize: function() {
        this.albums = new Albums();
    },

    thumbnail: function() {
        return this.get('thumbnailUrl');
    },

    fanart: function() {
        return this.get('fanartUrl');
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