var Playable = require('models/playable');
var musicController = require('controllers/music');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/music/artist_album_item'),

    className: 'albumContainer',

    events: {
        'click .add-to-playlist': 'addToPlaylist',
        'click .play': 'play'
    },

    addToPlaylist: function() {
        musicController.addAlbumToPlaylist(this.model);
    },

    play: function() {
        this.model.play();
    }
    
});