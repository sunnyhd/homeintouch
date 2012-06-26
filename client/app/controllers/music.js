var app = require('app');
var Albums = require('collections/albums');
var Artists = require('collections/artists');
var Songs = require('collections/songs');
var Album = require('models/album');
var Artist = require('models/artist');
var ArtistListView = require('views/music/artist_list');
var AlbumListView = require('views/music/album_list');
var SongListView = require('views/music/song_list');
var AlbumSongListView = require('views/music/album_song_list');
var ArtistAlbumListView = require('views/music/artist_album_list');
var playlistsController = require('controllers/playlists');

exports.showArtistList = function() {
    var artists = new Artists();
    var view = new ArtistListView({ collection: artists });
    app.main.show(view);
    return artists;
};

exports.showAlbumList = function() {
    var albums = new Albums();
    var view = new AlbumListView({ collection: albums });
    app.main.show(view);
    return albums;
};

exports.showSongList = function() {
    var songs = new Songs();
    var view = new SongListView({ collection: songs });
    app.main.show(view);
    return songs;
};

exports.showArtistAlbumList = function(artistid) {
    var artist = new Artist({ artistid: artistid });
    var view = new ArtistAlbumListView({ model: artist });
    app.main.show(view);
    return artist;
};

exports.showAlbumSongList = function(albumid) {
    var album = new Album({ albumid: albumid });
    var view = new AlbumSongListView({ model: album });
    app.main.show(view);
    return album;
};

exports.addSongToPlaylist = function(song) {
    playlistsController.addToPlaylist('audio', { songid: song.id });
};