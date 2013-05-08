var AlbumDetailView = require('views/music/artist_album_item');
var SongListView = require('views/music/album_song_list');

var musicController = require('controllers/music');
var Playable = require('models/playable');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/music/artist_album_item_container'),

    tagName: 'li',

    className: 'album',

    regions: {
        albumDetail: "#album-detail",
        songList: "#song-list"
    },

    events: {
        'click [data-action="play-album"]': 'playAlbum',
        'click [data-action="playlist-album"]': 'addAlbumToPlaylist'
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var albumDetailView = new AlbumDetailView({ model: this.model });
        this.albumDetail.show(albumDetailView);

        var songListView = new SongListView({ model: this.model });
        this.songList.show(songListView);
    },

    // Actions

    playAlbum: function() {
        console.log('Play albumid: ' + this.model.get('albumid'));
        musicController.addAlbumToPlaylist(this.model, 0);
    },

    addAlbumToPlaylist: function() {
        console.log('Adding to playlist albumid: ' + this.model.get('albumid'));
        musicController.addAlbumToPlaylist(this.model);
    }

});