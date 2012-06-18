var app = require('app');
var Artists = require('collections/artists');
var Playlists = require('collections/playlists');
var Album = require('models/album');
var Artist = require('models/artist');
var ArtistListView = require('views/music/artist_list');
var AlbumSongListView = require('views/music/album_song_list');
var ArtistAlbumListView = require('views/music/artist_album_list');
var mediaViews = require('views/media');

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

exports.addSongToPlaylist = function(song) {
    var playlists = new Playlists();
    playlists.fetch();

    var form = new mediaViews.AddToPlaylistForm({ collection: playlists });
    form.on("save", function(playlistid) {
        var playlist = playlists.get(playlistid);

        if (playlist) {
            playlist.items.create({ songid: song.id });
        } else {
            alert('Invalid playlist');
        }
    });

    app.modal.show(form);
};