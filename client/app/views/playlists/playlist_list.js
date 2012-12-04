var PlaylistItemView = require('views/playlists/playlist_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/playlists/playlist_list'),

    itemView: PlaylistItemView,

    appendHtml: function(cv, iv) {
        this.$('.items').append(iv.el);
    }

});