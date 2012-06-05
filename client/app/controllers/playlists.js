var app = require('app');
var Playlists = require('collections/playlists');
var mediaViews = require('views/media');

var playlists = exports.playlists = new Playlists();

exports.showPlaylists = function() {
    var view = new mediaViews.PlaylistsLayout({ collection: playlists });
    app.subnav.show(view);

    playlists.fetch().then(function() {
        var playlist = playlists.getSelected() || playlists.getDefault();
        exports.selectPlaylist(playlist);
    });
};

exports.selectPlaylist = function(playlist) {
    playlists.select(playlist);
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
    var view = new mediaViews.PlaylistLayout({ collection: playlist.items });
    app.main.show(view);
};