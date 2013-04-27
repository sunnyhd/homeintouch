var PlaylistItemView = require('views/playlists/playlist_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/playlists/playlist_list'),

    itemView: PlaylistItemView,

    initialize: function() {
        this.bindTo(this.collection, 'add remove reset', this.render, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.items').append(iv.el);
    }

});