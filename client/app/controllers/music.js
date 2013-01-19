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
var ArtistContainerView = require('views/music/artist_container');
var MusicHomeView = require('views/music/home');

exports.artists = new Artists();
exports.loading = null;

exports.showHomeView = function() {

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'Music', 
        handler: function(e) {
            app.router.navigate('#music', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'Music', 
        previous: 'Home',
        handler: function(e) {
            app.router.navigate('', {trigger: true});
            return false;
        }
    });

    var view = new MusicHomeView();
    app.main.show(view);
};

exports.showArtistList = function() {

    exports.loading.done(function(){
        $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
        app.updateDesktopBreadcrumbNav( { 
            itemType: 'floor',
            name: 'Artist', 
            handler: function(e) {
                app.router.navigate('#music/artists', {trigger: true});
                return false;
            }
        });

        app.updateTouchNav({
            name: 'Artist', 
            previous: 'Music',
            handler: function(e) {
                app.router.navigate('#music', {trigger: true});
                return false;
            }
        });

        var view = new ArtistContainerView({ collection: exports.artists, mode: 'cover'});
        app.main.show(view);
    });

};

exports.showAlbumList = function() {

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'Albums', 
        handler: function(e) {
            app.router.navigate('#music/albums', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'Albums', 
        previous: 'Music',
        handler: function(e) {
            app.router.navigate('#music', {trigger: true});
            return false;
        }
    });

    var albums = new Albums();
    var view = new AlbumListView({ collection: albums });
    app.main.show(view);
    return albums;
};

exports.showSongList = function() {

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'Songs', 
        handler: function(e) {
            app.router.navigate('#music/songs', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'Songs', 
        previous: 'Music',
        handler: function(e) {
            app.router.navigate('#music', {trigger: true});
            return false;
        }
    });

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

exports.addSongToPlaylist = function(song, position) {
    var options = { item: { songid: song.id }};

    if (position !== undefined) {
        options.position = position;
    }

    playlistsController.addToPlaylist('audio', options);
};

exports.addAlbumToPlaylist = function(album, position) {
    var options = { item: { albumid: album.id }};

    if (position !== undefined) {
        options.position = position;
    }

    playlistsController.addToPlaylist('audio', options);
};