var app = require('app');
var playerController = require('controllers/players');
var Playlists = require('collections/playlists');
var Playlist = require('models/playlist');
var PlaylistListView = require('views/playlists/playlist_list');
var PlaylistTabsListView = require('views/playlists/playlist_tabs_list');

var playlists = exports.playlists = new Playlists();
var playlistIds = {};

exports.getPlaylistId = function(type) {
    return playlistIds[type];
};

exports.init = function(pls) {
    setPlaylists(pls);

    playerController.players.on('change:position change:item add', function(player) {
        onPlayerChange(player, player.get('position'));
    });

    playerController.players.on('remove', function(player) {
        onPlayerChange(player, -1);
    });
};

var onPlayerChange = function(player, newPos) {
    var id = exports.getPlaylistId(player.get('type').toLowerCase());
    var playlist = playlists.get(id);

    if(playlist) {
        playlist.setCurrent(newPos);
    }
};

var setPlaylists = function(pls) {
    playlists.reset(pls);

    playlistIds = {};
    playlists.forEach(function(playlist) {
        playlistIds[playlist.get('type')] = playlist.id;

        playerController.findPlayerForPlaylist(playlist).then(function(player) {
            var pos = (!player)? -1: player.get('position'); 
            playlist.setCurrent(pos);
        });
    });
};

exports.showPlaylists = function() {
    var view = new PlaylistTabsListView({ collection: playlists });
    app.main.show(view);

    exports.selectPlaylist(playlists.getSelected());
    /*playlists.fetch().then(function() {
        var playlist = playlists.getSelected() || playlists.getDefault();
        exports.selectPlaylist(playlist);
    });*/

};

exports.selectPlaylist = function(playlist) {
    playlists.select(playlist);
};

exports.addToPlaylist = function(type, options) {
    var playlistid = exports.getPlaylistId(type);
    var playlist = new Playlist({ playlistid: playlistid });
    return playlist.items.create(options);
};

exports.removeFromPlaylist = function(item) {
    var type = item.getType() || item.type;

    var playlistid = exports.getPlaylistId(type);
    var playlist = playlists.get(playlistid);

    if(playlist) {
        var plItem = playlist.items.get(item.id);
        if(plItem) plItem.destroy();
    }
};

// Events
// ---------------

exports.playlists.on('select', function(playlist) {
    //showPlaylist(playlist);
    playlist.loadItems();
});


// Helpers
// ---------------

var showPlaylist = function(playlist) {
    var view = new PlaylistListView({ model: playlist, collection: playlist.items });
    //app.main.show(view);
};

// Notifications


app.vent.on('xbmc:playlist:onclear', function(data) {
    var playlist = playlists.get(data.playlistid);
    if(playlist) {
        playlist.clear();
    }
});

app.vent.on('xbmc:playlist:onadd', function(data) {
    var playlist = playlists.get(data.playlistid);
    if(playlist) {
        playlist.add(data.position, data.item);
    }
});

app.vent.on('xbmc:playlist:onremove', function(data) {
    var playlist = playlists.get(data.playlistid);
    if(playlist) {
        playlist.removeAt(data.position);
    }
});