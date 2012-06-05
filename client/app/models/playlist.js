var PlaylistItems = require('collections/playlist_items');

module.exports = Backbone.Model.extend({

    idAttribute: 'playlistid',

    initialize: function() {
        this.items = new PlaylistItems();
        this.items.url = '/api/playlists/' + this.id + '/items';
    }

});