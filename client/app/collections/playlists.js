var Playlist = require('models/playlist');

module.exports = Backbone.Collection.extend({

    model: Playlist,

    url: '/api/playlists',

    getDefault: function() {
        return this.at(0);
    },

    select: function(playlist) {
        this.selected = playlist;
        this.trigger('select', playlist);
    },

    getSelected: function() {
        return this.selected;
    }

});