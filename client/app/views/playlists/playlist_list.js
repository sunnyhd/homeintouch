
var PlaylistItemView = require('views/playlists/playlist_item');
var playlistsController = require('controllers/playlists');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/playlists/playlist_list'),

    itemView: PlaylistItemView,

    initialize: function() {
        this.bindTo(this.collection, 'add remove reset', this.render, this);

        this.on('render', this.togglePlaylists, this);
        this.bindTo(this.collection, 'add remove reset', this.togglePlaylists, this);

        this.on('clear', this.clear, this);
        this.on('edit-order', this.editOrderView, this);
        this.on('edit-order-ok', this.editOrderDone, this);
    },

    appendHtml: function(cv, iv) {

        // Add listeners to the item view
        this.bindTo(iv, 'clear-more-opts', this.clearMoreOptions, this);
        this.bindTo(iv, 'swap-up', this.swapUp, this);
        this.bindTo(iv, 'swap-down', this.swapDown, this);

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

    // Swap item methods

    swapUp: function(id) {
        var prevId = id - 1;
        this.swap(prevId, id);
    }, 

    swapDown: function(id) {
        var nextId = id + 1;
        this.swap(id, nextId);
    },

    swap: function(firstId, secondId) {
        return playlistsController.swapItems(this.model, firstId, secondId);
    },

    editOrderView: function() {
        this.clearMoreOptions();

        // Hides more buttons
        this.$el.find('[data-action="more"]').hide();

        // Displays swap buttons
        this.$el.find('.swap-button').show();
    },

    editOrderDone: function() {

        // Displays more buttons
        this.$el.find('[data-action="more"]').show();

        // Hides swap buttons
        this.$el.find('.swap-button').hide();
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