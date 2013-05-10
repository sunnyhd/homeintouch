var app = require('app');

// Collections
var Playlists = require('collections/playlists');

// Models
var Playlist = require('models/playlist');
var PlaylistItem = require('models/playlist_item');

// Views
var LoadingView = require('views/loading_content');
var PlaylistListView = require('views/playlists/playlist_list');
var PlaylistTabsListView = require('views/playlists/playlist_tabs_list');

// Controllers
var playerController = require('controllers/players');
var movieController = require('controllers/movies');
var musicController = require('controllers/music');
var tvShowController = require('controllers/tvshows');
var pictureController = require('controllers/pictures');

var Command = require('models/player_command');


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

        updatePlaylistPosition(playlist);
    });
	// Set the playlist ids in the Command module
    Command.setPlaylistIds(playlistIds);
};

function updatePlaylistPosition(playlist) {
   playerController.findPlayerForPlaylist(playlist)
        .then(function(player) {
            var pos = (!player)? -1: player.get('position'); 
            playlist.setCurrent(pos);
        })
        .done();
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

exports.swapItems = function(playlist, pos1, pos2) {
    if(playlist.items.at(pos1) && playlist.items.at(pos2)) {
        // We need to call PUT on the server 
        // without updating the collection (we'll refresh it afterwards)
        // So we create a new item outside the playlist and set the correct URL
        var item = new PlaylistItem({id: pos1, newPosition: pos2});
        item.urlRoot = playlist.items.url();
        return Q.when(item.save())
            .then(function(result) {
                return loadPlaylistItems(playlist, true);
            })
            .then(function() {
                // After loading the items, get the player
                return playerController.findPlayerForPlaylist(playlist);
            })
            .then(function(player) {
                // If a player exists and its current position was one of the swapped, update it.
                if(player) {
                    var currentPos = player.get('position');
                    if(currentPos === pos1) player.set('position', pos2);
                    if(currentPos === pos2) player.set('position', pos1);
                }
                return playlist;
            });
    }
    return Q.when(false);
};


exports.clearPlaylist = function(playlist) {
    // Create a new one so the actual playlist is not removed.
    var pl = new Playlist({ playlistid: playlist.id });
    pl.urlRoot = playlists.url; 
    return pl.destroy();
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
function loadPlaylistItem(pl, item) {
    var loader;
    var type = (item.type.toLowerCase() === 'unknown')?pl.get('type'):item.type;

    switch(type.toLowerCase()) {
        case 'video':
        case 'movie':
            loader = movieController.findMovie;
            break;
        case 'episode':
            loader = tvShowController.findEpisode;
            break;
        case 'audio':
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
    loadPlaylistItems(playlist).done();
});

function loadPlaylistItems(playlist, force) {
    return playlist.loadItems(force)
    .then(function() {
        updatePlaylistPosition(playlist);
        return playlist;
    });
};

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
        loadPlaylistItem(playlist, data.item).then(function(item) {
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