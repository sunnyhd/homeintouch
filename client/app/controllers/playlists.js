var app = require('app');
var Playlists = require('collections/playlists');
var Playlist = require('models/playlist');
var PlaylistListView = require('views/playlists/playlist_list');
var PlaylistTabsListView = require('views/playlists/playlist_tabs_list');

var playlists = exports.playlists = new Playlists();

exports.showPlaylists = function() {
    var view = new PlaylistTabsListView({ collection: playlists });
    app.subnav.show(view);

    playlists.fetch().then(function() {
        var playlist = playlists.getSelected() || playlists.getDefault();
        exports.selectPlaylist(playlist);
    });
};

exports.selectPlaylist = function(playlist) {
    playlists.select(playlist);
};

exports.addToPlaylist = function(type, options) {
    /*var playlistid = playersController.getPlayerId(type);
    var playlist = new Playlist({ playlistid: playlistid });
    return playlist.items.create(options);*/
};

// Events
// ---------------

exports.playlists.on('select', function(playlist) {
    showPlaylist(playlist);
    playlist.items.fetch();
});

// Helpers
// ---------------

var showPlaylist = function(playlist) {
    var view = new PlaylistListView({ model: playlist, collection: playlist.items });
    app.main.show(view);
};