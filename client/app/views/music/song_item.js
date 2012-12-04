var musicController = require('controllers/music');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'song',
    
    template: require('templates/music/song_item'),

    events: {
        'click .add-to-playlist': 'addToPlaylist',
        'click .play': 'play'
    },

    addToPlaylist: function(e) {
        e.preventDefault();
        musicController.addSongToPlaylist(this.model);
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    }
    
});