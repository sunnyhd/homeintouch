var Playable = require('models/playable');
var musicController = require('controllers/music');
var playersController = require('controllers/players');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'album',
    
    template: require('templates/music/album_item'),

    events: {
        'click .add-to-playlist': 'addToPlaylist',
        'click .play': 'play'
    },

    addToPlaylist: function() {
        musicController.addAlbumToPlaylist(this.model);
    },

    play: function() {
        musicController.addAlbumToPlaylist(this.model, 0);

        var playlistid = playersController.getPlayerId('audio');
        var playable = new Playable({ item: { playlistid: playlistid, position: 0 }});
        playable.save();
    }
    
});