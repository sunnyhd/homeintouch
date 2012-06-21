module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'playlist-item',

    template: require('templates/playlists/playlist_item'),

    events: {
        'click .play': 'play',
        'click .remove': 'removeFromPlaylist'
    },

    onRender: function() {
        if (this.model.isActive()) {
            this.$el.addClass('active');
        }
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    },

    removeFromPlaylist: function(e) {
        e.preventDefault();
        this.model.removeFromPlaylist();
    }

});