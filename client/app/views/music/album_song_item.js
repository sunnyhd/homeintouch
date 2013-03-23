var SongItemView = require('views/music/song_item');
var musicController = require('controllers/music');

module.exports = SongItemView.extend({
    
    template: require('templates/music/album_song_item'),

    events: {
        'click': 'playSong',
        'click [data-action="play-song"]': 'playSong',
        'click [data-action="playlist-song"]': 'addSongToPlaylist'
    },

    // Actions

    playSong: function() {
        console.log('Play songid: ' + this.model.get('songid'));
        this.model.play();
        return false;
    },

    addSongToPlaylist: function() {
        console.log('Adding to playlist songid: ' + this.model.get('songid'));
        musicController.addSongToPlaylist(this.model);
        return false;
    }
    
});