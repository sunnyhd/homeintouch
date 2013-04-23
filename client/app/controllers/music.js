var app = require('app');
var Albums = require('collections/albums');
var Artists = require('collections/artists');
var Songs = require('collections/songs');
var Album = require('models/album');
var Artist = require('models/artist');
var Song = require('models/song');
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

    // Removes previous link texts
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

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

        updateListNav('Artists', '#music/artists');
        var view = new ArtistContainerView({ collection: exports.artists, mode: 'cover'});
        app.main.show(view);
    });
};

exports.showArtistListView = function() {

    exports.loading.done(function(){

        updateListNav('Artists', '#music/artists');
        var view = new ArtistContainerView({ collection: exports.artists, mode: 'list'});
        app.main.show(view);
    });
};

exports.loadMusic = function() {
    var loadingArtists = exports.artists.fetch();
    var loadingAlbums = exports.albums.fetch();
    var loadingSongs = exports.songs.fetch();
    var loadingAlbumsGenres = $.get('/api/genres/albums').done(function (data) { exports.filters.album.genres = data; });
    var loadingAlbumsYears = $.get('/api/years/albums').done(function (data) { exports.filters.album.years = data; });
    var loadingArtistsGenres = $.get('/api/genres/artists').done(function (data) { exports.filters.artist.genres = data; });

    exports.loading = $.when(loadingArtists, loadingAlbums, loadingSongs, loadingAlbumsGenres, loadingAlbumsYears, loadingArtistsGenres);
}

/**
 * Retrieves the song by id, either from the client if it has already been loaded
 * or from the server
 */
exports.findSong = function(id) {
    var song = exports.songs.get(id);
    if(!song) {
        song = new Song({ songid: id });
        return Q.when(song.fetch()).then(function() {
            exports.songs.add(song);
            return song;
        });
    }
    return Q.when(song);
};

var updateListNav = function(title, url) {

    // Removes previous link texts
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
        name: title, 
        handler: function(e) {
            app.router.navigate(url, {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: title, 
        previous: 'Music',
        handler: function(e) {
            app.router.navigate('#music', {trigger: true});
            return false;
        }
    });
};

exports.showAlbumList = function() {

    exports.loading.done(function(){

        updateListNav('Albums', '#music/albums');
        var view = new AlbumContainerView({ collection: exports.albums});
        app.main.show(view);
    });
};

exports.showSongList = function() {

    exports.loading.done(function(){

        updateListNav('Songs', '#music/songs');
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