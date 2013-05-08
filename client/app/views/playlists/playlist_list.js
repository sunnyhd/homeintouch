var PlaylistItemView = require('views/playlists/playlist_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/playlists/playlist_list'),

    itemView: PlaylistItemView,

    initialize: function() {
        this.bindTo(this.collection, 'add remove reset', this.render, this);

        this.on('render', this.togglePlaylists, this);
        this.bindTo(this.collection, 'add remove reset', this.togglePlaylists, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.items').append(iv.el);
    },

    togglePlaylists: function() {
        var $noItems = this.$el.find('.no-playlist-container');
        var $withItems = this.$el.find('.playlist-list-container');

        if (this.collection.size() > 0) {
            $noItems.hide();
            $withItems.show();
        } else {
            $noItems.show();
            $withItems.hide();
        }
    }

});