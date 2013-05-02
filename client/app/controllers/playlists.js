var app = require('app');
var playerController = require('controllers/players');
var Playlists = require('collections/playlists');
var Playlist = require('models/playlist');
var PlaylistListView = require('views/playlists/playlist_list');
var PlaylistTabsListView = require('views/playlists/playlist_tabs_list');

var movieController = require('controllers/movies');
var musicController = require('controllers/music');
var tvShowController = require('controllers/tvshows');
var pictureController = require('controllers/pictures');

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

/**
 * Loads the item details from the appropriate controller based on the type
 */
function loadPlaylistItem(item) {
    var loader;
    switch(item.type.toLowerCase()) {
        case 'movie':
            loader = movieController.findMovie;
            break;
        case 'episode':
            loader = tvShowController.findEpisode;
            break;
        case 'song':
            loader = musicController.findSong;
            break;
        case 'picture':
            return pictureController.getPicture(item);
    }

    return loader(item.id);
} 

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
        // We need more info on the item, so we grab it from the appropriate controller
        loadPlaylistItem(data.item).then(function(item) {
            playlist.add(data.position, item);
        });
    }
});

app.vent.on('xbmc:playlist:onremove', function(data) {
    var playlist = playlists.get(data.playlistid);
    if(playlist) {
        playlist.removeAt(data.position);
    }
});