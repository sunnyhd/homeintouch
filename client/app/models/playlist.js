var PlaylistItems = require('collections/playlist_items');

module.exports = Backbone.Model.extend({

    idAttribute: 'playlistid',

    initialize: function() {
        this.items = new PlaylistItems();
        this.items.url = '/api/playlists/' + this.id + '/items';
    },

    title: function() {
        var type = this.get('type');
        return type.charAt(0).toUpperCase() + type.slice(1);
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.title = this.title();
        return data;
    }

});