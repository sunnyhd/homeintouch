var app = require('app');
var Albums = require('collections/albums');
var Artists = require('collections/artists');
var Songs = require('collections/songs');
var PaginatedSongs = require('collections/songs_paginated');
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
exports.paginatedSongs = new PaginatedSongs();

// Filter for albums
exports.filters = {
    album: {},
    artist: {}
};

exports.filters.album.genres = null;
exports.filters.album.years = null;
exports.filters.artist.genres = null;

exports.loading = null;

exports.loadingArtistData = null;
exports.loadingAlbumData = null;

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

    loadArtistData();

    exports.loadingArtistData.done(function(){

        updateListNav('Artists', '#music/artists');
        var view = new ArtistContainerView({ collection: exports.artists, mode: 'cover'});
        app.main.show(view);
    });
};

exports.showArtistListView = function() {

    loadArtistData();

    exports.loadingArtistData.done(function(){

        updateListNav('Artists', '#music/artists');
        var view = new ArtistContainerView({ collection: exports.artists, mode: 'list'});
        app.main.show(view);
    });
};

exports.showAlbumList = function() {

    loadAlbumData();

    exports.loadingAlbumData.done(function(){

        updateListNav('Albums', '#music/albums');
        var view = new AlbumContainerView({ collection: exports.albums});
        app.main.show(view);
    });
};

exports.showSongList = function() {

    var loadingPaginatedSongs = exports.paginatedSongs.fetch();

    loadingPaginatedSongs.done(function(){

        updateListNav('Songs', '#music/songs');
        var view = new SongContainerView({ collection: exports.paginatedSongs });
        app.main.show(view);
    });
};

loadArtistData = function() {

    if (_.isNull(exports.loadingArtistData)) {
        var loadingArtists = exports.artists.fetch();
        var loadingArtistsGenres = $.get('/api/genres/artists').done(function (data) { exports.filters.artist.genres = data; });
    }

    exports.loadingArtistData = $.when(loadingArtists, loadingArtistsGenres);
};

loadAlbumData = function() {

    if (_.isNull(exports.loadingAlbumData)) {
        var loadingAlbums = exports.albums.fetch();
        var loadingAlbumsGenres = $.get('/api/genres/albums').done(function (data) { exports.filters.album.genres = data; });
        var loadingAlbumsYears = $.get('/api/years/albums').done(function (data) { exports.filters.album.years = data; });
    }

    exports.loadingAlbumData = $.when(loadingAlbums, loadingAlbumsGenres, loadingAlbumsYears);

};

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

var updateArtistNav = function(artist) {

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
};

var updateAlbumNav = function(artist) {

    var album = artist.albums.models[0];

    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'inner-room',
        name: album.get('label'), 
        handler: function(e) {
            app.router.navigate('#music/albums/' + album.get('albumid'), {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: album.get('label'), 
        previous: 'Albums',
        handler: function(e) {
            app.router.navigate('#music/albums', {trigger: true});
            return false;
        }
    });
};

var getArtistAlbums = function(artistid) {
    var albumList = _.filter(exports.albums.models, function(album) {
        return (album.get('artistid').indexOf(artistid) >= 0);
    });

    return new Albums(albumList);
};

var loadAlbumSongs = function(album) {
    album.songs = new Songs ();
    album.songs.albumid = album.get('albumid');
    album.songs.comparator = function(song) { return song.get('track'); };
    return album.songs.fetch();
};

exports.showArtistDetailsView = function(artistid) {

    var artist = null;
    var def = new $.Deferred();
    var loadingArtist = def.promise();

    // Show the loading view
    app.showLoading(loadingArtist);

    // When the artist instace is loaded, displays its data
    loadingArtist.done(function() {

        updateArtistNav(artist);
        var view = new ArtistDetailView({ model: artist, mode: 'artist' });
        app.main.show(view);
    });

    // If the collection is loaded
    if (!_.isUndefined(exports.artists) && exports.artists.models.length > 0) {
        artist = exports.artists.get(artistid);
        artist.albums = getArtistAlbums(artist.get('artistid'));
        var loadingSongs = [];
        _.each(artist.albums.models, function(album) {
            loadingSongs.push(loadAlbumSongs(album));
        });

        $.when.apply($, loadingSongs).done(function() {
            def.resolve();
        });

    // If not, loads the artist instance
    } else {
        artist = new Artist({ artistid: artistid });
        var fetchingArtist = artist.fetch();
        var fetchingAlbums = null;
        var fetchingArtistDetails = fetchingArtist;
        if (_.isUndefined(exports.albums) || exports.albums.models.length == 0) {
            fetchingAlbums = exports.albums.fetch();
            fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums);
        }

        fetchingArtistDetails.done(function() {
            artist.albums = getArtistAlbums(artist.get('artistid'));
            var loadingSongs = [];
            _.each(artist.albums.models, function(album) {
                loadingSongs.push(loadAlbumSongs(album));
            });
            
            $.when.apply($, loadingSongs).done(function() {
                def.resolve();
            });
        });
    }
};


exports.showAlbumSongList = function(albumid) {

    var artist = null;
    var def = new $.Deferred();
    var loadingArtist = def.promise();

    // Show the loading view
    app.showLoading(loadingArtist);

    // When the artist instance is loaded, displays its data
    loadingArtist.done(function() {

        updateAlbumNav(artist);
        var view = new ArtistDetailView({ model: artist, mode: 'album' });
        app.main.show(view);
    });

    if (!_.isUndefined(exports.albums) && exports.albums.models.length > 0) {
        var album = exports.albums.get(albumid);
        artist = exports.artists.where({'artistid' : album.get('artistid')[0]})[0];
        artist.albums = new Albums([album]);
        loadAlbumSongs(album).done(function() {
            def.resolve();
        });
    } else {
        var album = new Album({ albumid: albumid });
        
        var fetchingAlbums = album.fetch();
        var fetchingArtist = null;
        var fetchingArtistDetails = fetchingAlbums;
        if (_.isUndefined(exports.artists) || exports.artists.models.length === 0) {
            fetchingArtist = exports.artists.fetch();
            fetchingArtistDetails = $.when(fetchingArtist, fetchingAlbums);
        }

        fetchingArtistDetails.done(function() {
            artist = exports.artists.where({'artistid' : album.get('artistid')[0]})[0];
            artist.albums = new Albums([album]);
            loadAlbumSongs(album).done(function() {
                def.resolve();
            });
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