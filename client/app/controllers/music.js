var app = require('app');
var Albums = require('collections/albums');
var Artists = require('collections/artists');
var Songs = require('collections/songs');
var Album = require('models/album');
var Artist = require('models/artist');
var AlbumSongListView = require('views/music/album_song_list');
var ArtistAlbumListView = require('views/music/artist_album_list');
var playlistsController = require('controllers/playlists');
var ArtistDetailView = require('views/music/artist_detail')

var ArtistContainerView = require('views/music/artist_container');
var AlbumContainerView = require('views/music/album_container');
var SongContainerView = require('views/music/song_container');
var MusicHomeView = require('views/music/home');

exports.artists = new Artists();
exports.albums = new Albums();
exports.songs = new Songs();

// Filter for albums
exports.filters = {
    album: {},
    artist: {}
};

exports.filters.album.genres = null;
exports.filters.album.years = null;
exports.filters.artist.genres = null;

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
            itemType: 'room',
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

exports.showArtistListView = function() {

    exports.loading.done(function(){
        $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
        app.updateDesktopBreadcrumbNav( { 
            itemType: 'room',
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

        var view = new ArtistContainerView({ collection: exports.artists, mode: 'list'});
        app.main.show(view);
    });
};

exports.showAlbumList = function() {

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
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

    var view = new AlbumContainerView({ collection: exports.albums});
    app.main.show(view);
};

exports.showSongList = function() {

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
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

    var view = new SongContainerView({ collection: exports.songs });
    app.main.show(view);
};

exports.showArtistDetailsView = function(artistid) {

    var artist = null;
    var def = new $.Deferred();
    var loadingArtist = def.promise();

    // Show the loading view
    app.showLoading(loadingArtist);

    // When the movie instace is loaded, displays its data
    loadingArtist.done(function() {
        var view = new ArtistDetailView({ model: artist });
        app.main.show(view);
    });

    // If the collection is loaded
    if (!_.isUndefined(exports.artists) && exports.artists.models.length > 0) {
        artist = exports.artists.get(artistid);
        def.resolve();

    // If not, loads the artist instance
    } else {
        artist = new Artist({ artistid: artistid });
        artist.fetch().done(function() {
            def.resolve();
        });
    }
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