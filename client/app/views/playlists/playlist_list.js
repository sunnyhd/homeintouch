
var PlaylistItemView = require('views/playlists/playlist_item');
var playlistsController = require('controllers/playlists');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/playlists/playlist_list'),

    itemView: PlaylistItemView,

    events: {
        'click [data-action=clear]': 'clear',
    },

    initialize: function() {
        this.bindTo(this.collection, 'add remove reset', this.render, this);

        this.on('render', this.togglePlaylists, this);
        this.bindTo(this.collection, 'add remove reset', this.togglePlaylists, this);
    },

    appendHtml: function(cv, iv) {

        // Add listeners to the item view
        this.bindTo(iv, 'clear-more-opts', this.clearMoreOptions, this);

        this.$('.items').append(iv.el);
    },

    clearMoreOptions: function() {
        var $moreOpts = this.$el.find('.more-opts-container');
        var $liEl = $moreOpts.closest('li');

        var $icon = $liEl.find('[data-action="more"] i');
        $icon.removeClass('icon-chevron-up');
        $icon.addClass('icon-chevron-down');

        $moreOpts.remove();
    },

    clear: function() {
        return playlistsController.clearPlaylist(this.model);
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