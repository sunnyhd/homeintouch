var app = require('app');
var musicController = require('controllers/music');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'song',
    
    template: require('templates/music/song_item'),

    iconNoImg: app.getBackgroundIcon('media.defaultSong', '#333333'),

    events: {
        'click [data-action="play"]': 'play',
        'click [data-action="play-album"]': 'playAlbum',
        'click [data-action="playlist"]': 'addToPlaylist'
    },

    addToPlaylist: function(e) {
        musicController.addSongToPlaylist(this.model);
        return false;
    },

    play: function(e) {
        this.model.play();
        return false;
    },

    playAlbum: function(e) {
        this.model.play();
        return false;
    },

    onRender: function() {
        var $noImgContainer = this.$el.find('.no-img');
        if ($noImgContainer.length > 0) {
            app.applyBackgroundIcon($noImgContainer, this.iconNoImg);
        }
    }
    
});