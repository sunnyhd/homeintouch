var app = require('app');
var Albums = require('collections/albums');
var Artists = require('collections/artists');
var Songs = require('collections/songs');
var Album = require('models/album');
var Artist = require('models/artist');
var ArtistAlbumListView = require('views/music/artist_album_list');
var playlistsController = require('controllers/playlists');
var ArtistDetailView = require('views/music/artist_detail_container');

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

exports.showArtistCoverView = function() {

    exports.loading.done(function(){

        // Removes previous link texts
        $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
        $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

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

        // Removes previous link texts
        $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
        $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

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

    exports.loading.done(function(){

        // Removes previous link texts
        $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
        $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

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
    });
};

exports.showSongList = function() {

    exports.loading.done(function(){

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
    });
};

exports.showArtistDetailsView = function(artistid) {

    var artist = null;
    var def = new $.Deferred();
    var loadingArtist = def.promise();

    // Show the loading view
    app.showLoading(loadingArtist);

    // When the artist instace is loaded, displays its data
    loadingArtist.done(function() {

        $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html(''); // Removes previous link texts
        app.updateDesktopBreadcrumbNav( { 
            itemType: 'inner-room',
            name: artist.get('label'), 
            handler: function(e) {
                app.router.navigate('#music/artists/' + artist.get('artistid'), {trigger: true});
                return false;
            }
        });

        app.updateTouchNav({
            name: artist.get('label'), 
            previous: 'Artist',
            handler: function(e) {
                app.router.navigate('#music/artists', {trigger: true});
                return false;
            }
        });

        var view = new ArtistDetailView({ model: artist, mode: 'artist' });
        app.main.show(view);
    });

    // If the collection is loaded
    if (!_.isUndefined(exports.artists) && exports.artists.models.length > 0) {
        artist = exports.artists.get(artistid);
        artist.albums = new Albums(exports.albums.where({'artistid' : artist.get('artistid')}));
        _.each(artist.albums.models, function(album) {
            album.songs = new Songs (exports.songs.where({'albumid' : album.get('albumid')}));
            album.songs.comparator = function(song) { return song.get('track'); };
            album.songs.sort({silent: true});
        });
        def.resolve();

    // If not, loads the artist instance
    } else {
        artist = new Artist({ artistid: artistid });
        var fetchingArtist = artist.fetch();
        var fetchingAlbums = null;
        var fetchingSongs = null;
        var fetchingArtistDetails = fetchingArtist;
        if (_.isUndefined(exports.albums) || exports.albums.models.length == 0) {
            fetchingAlbums = exports.albums.fetch();
            if (_.isUndefined(exports.songs) || exports.songs.models.length == 0) {
                fetchingSongs = exports.songs.fetch();
                fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums, fetchingSongs);
            } else {
                fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums);
            }
        }

        fetchingArtistDetails.done(function() {
            artist.albums = new Albums(exports.albums.where({'artistid' : artist.get('artistid')}));
            _.each(artist.albums.models, function(album) {
                album.songs = new Songs (exports.songs.where({'albumid' : album.get('albumid')}));
                album.songs.comparator = function(song) { return song.get('track'); };
                album.songs.sort({silent: true});
            });
            def.resolve();
        });
    }
};


exports.showAlbumSongList = function(albumid) {

    var artist = null;
    var def = new $.Deferred();
    var loadingArtist = def.promise();

    // Show the loading view
    app.showLoading(loadingArtist);

    // When the artist instace is loaded, displays its data
    loadingArtist.done(function() {

        $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html(''); // Removes previous link texts
        app.updateDesktopBreadcrumbNav( { 
            itemType: 'inner-room',
            name: artist.albums.models[0].get('label'), 
            handler: function(e) {
                app.router.navigate('#music/albums/' + albumid, {trigger: true});
                return false;
            }
        });

        app.updateTouchNav({
            name: artist.albums.models[0].get('label'), 
            previous: 'Albums',
            handler: function(e) {
                app.router.navigate('#music/albums', {trigger: true});
                return false;
            }
        });

        var view = new ArtistDetailView({ model: artist, mode: 'album' });
        app.main.show(view);
    });

    if (!_.isUndefined(exports.albums) && exports.albums.models.length > 0) {
        var album = exports.albums.get(albumid);
        artist = exports.artists.where({'artistid' : album.get('artistid')})[0];
        artist.albums = new Albums([album]);

        album.songs = new Songs (exports.songs.where({'albumid' : album.get('albumid')}));
        album.songs.comparator = function(song) { return song.get('track'); };
        album.songs.sort({silent: true});
        def.resolve();
    } else {
        artist = new Artist({ artistid: artistid });
        var album = new Album({ albumid: albumid})
        var fetchingArtist = artist.fetch();
        var fetchingAlbums = null;
        var fetchingSongs = null;
        var fetchingArtistDetails = fetchingArtist;
        if (_.isUndefined(exports.albums) || exports.albums.models.length == 0) {
            fetchingAlbums = album.fetch();
            if (_.isUndefined(exports.songs) || exports.songs.models.length == 0) {
                fetchingSongs = exports.songs.fetch();
                fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums, fetchingSongs);
            } else {
                fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums);
            }
        }

        fetchingArtistDetails.done(function() {
            artist.albums = new Albums([album]);
            album.songs = new Songs (exports.songs.where({'albumid' : album.get('albumid')}));
            album.songs.comparator = function(song) { return song.get('track'); };
            album.songs.sort({silent: true});
            def.resolve();
        });
    }
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