var playlistsController = require('controllers/playlists');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    template: require('templates/playlists/playlist_tabs_item'),

    events: {
        'click a': 'playlistClicked'
    },

    onRender: function() {
        this.$el.attr('data-type', this.model.get('type'));
    },

    playlistClicked: function(e) {
        e.preventDefault();
        playlistsController.selectPlaylist(this.model);
    }

});