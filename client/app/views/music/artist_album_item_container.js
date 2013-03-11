var AlbumDetailView = require('views/music/artist_album_item');
var SongListView = require('views/music/album_song_list');

var musicController = require('controllers/music');
var playersController = require('controllers/players');
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
        'click [data-action="play"]': 'play',
        'click [data-action="playlist"]': 'addToPlaylist'
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var albumDetailView = new AlbumDetailView({ model: this.model });
        this.albumDetail.show(albumDetailView);

        var songListView = new SongListView({ model: this.model });
        this.songList.show(songListView);
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