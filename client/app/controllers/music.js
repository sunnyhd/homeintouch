var app = require('app');
var Artists = require('collections/artists');
var Album = require('models/album');
var Artist = require('models/artist');
var ArtistListView = require('views/music/artist_list');
var AlbumSongListView = require('views/music/album_song_list');
var ArtistAlbumListView = require('views/music/artist_album_list');

exports.showArtistList = function() {
    var artists = new Artists();
    var view = new ArtistListView({ collection: artists });
    app.main.show(view);
    return artists;
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