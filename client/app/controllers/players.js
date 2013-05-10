var app = require('app');

// Collections
var Players = require('collections/players');

// Models
var Player = require('models/player');

// Views
var LoadingView = require('views/loading_content');
var PlayerList = require('views/players/player_list');

// Controllers
var movieController = require('controllers/movies');
var musicController = require('controllers/music');
var tvShowController = require('controllers/tvshows');
var pictureController = require('controllers/pictures');

var players = exports.players = new Players();
var ids = {};

exports.loading = Q.when(true);

exports.setPlayerIds = function(players) {
    players.forEach(function(player) {
        ids[player.type] = player.playlistid;
    });
};

exports.getPlayerId = function(type) {
    return ids[type];
};

exports.findPlayerForPlaylist = function(playlist) {
	var id = exports.getPlayerId(playlist.get('type'));

	return exports.loading.then(function() {
		return players.get(id);
	});
};

/**
 * Loads and shows the players
 */
exports.showPlayers = function() {

	// Closes previous PlayerListView if exist
	app.desktopNowPlaying.close();
	app.addRegions ( { desktopNowPlaying: '#desktop-now-playing' } );

	// Displays the players on the region
	exports.showPlayersOnRegion(app.desktopNowPlaying);
};

/**
 * Loads and shows the players in a specific region
 */
exports.showPlayersOnRegion = function(region) {
	
	exports.loadActivePlayers().then(function() {
		var view = new PlayerList({ collection: players });
		region.show(view);
	});
	region.show(new LoadingView());
};

/**
 * Shutdown the players
 */
exports.close = function() {
    var player = players.getActive();

    if (player) {
        players.deactivate(player);
        player.turnOff();
    }
};

/**
 * Loads all the active players
 */
exports.loadActivePlayers = function() {

	// Get all the players
	exports.loading = Q.when(players.fetch()).then(function() {
		
		// Load the detailed information of all the players 
		var promises = players.map(function(player) {
			return exports.loadPlayerDetails(player);
		});

		// The returned promises will be resolved when all the players are loaded
		return Q.allResolved(promises);
	});
	return exports.loading;
};

/**
 * Loads the player details and fills the item information
 */
exports.loadPlayerDetails = function(player) {

	// Refresh the player
	return Q.when(player.fetch({silent:true}))
		.then(function() {
			// When the speed and time is retrieved, start the player (timer) and fill the item info
			player.start();
			return loadPlayerItem(player, player.get("item"));
		}, function(e) {
			console.log('Error while retrieving the player: ' + JSON.stringify(e));
			// We will consider an error here as the player no being active
			return null;
		})
		.then(function(item) {
			// Update the item info in the player
			player.set("item", item);
			//player.trigger('change:item');
			return player; 
		})
		.fail(function(e) {
			// Item not found on local DB
			console.log(JSON.stringify(e));
			
			// Add the required getType method to the existing item
			player.get('item').getType = function() {
				return player.get('item').type;
			};
			//TODO see what to do if the item is not found 
		});
};

/**
 * Loads the played item details from the appropriate controller based on the type
 */
function loadPlayerItem(player, item) {
	var loader;
	var type = (item.type.toLowerCase() === 'unknown')?player.get('type'):item.type;
	
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

/**
 * Retrieves a player by id, either from the client or from the server
 */
exports.findPlayer = function(id) {
	var player = players.get(id);

    if (player) {
        // Existing player
        return Q.when(player);
    } else {
    	// Fetch new player, add to collection
        return fetchPlayerFromServer(id);
    }
}

/**
 * Retrieves/refreshes a player by id from the server
 */
function fetchPlayerFromServer(id) {
    var player = new Player({ playerid: id });

    return exports.loadPlayerDetails(player)
		.then(function() {
			var p = players.get(player.id);

			if(!p) {
				// If the player is not loaded, add it to the players collection
				addPlayer(player);
				return player;	
			} else {
				// If the player is already loaded, update it with the data from the server
				p.set(player.toJSON());
				return p;
			}
        });
};

/**
 * Adds a player to the players collection.
 * Only pictures and music players can coexist, other players will be removed. 
 */
function addPlayer(player) {
    var type = player.get('type').toLowerCase();
    var remove = [];

    if (type === 'video') {
        // Remove all other players
        remove = players.toArray();
    } else if (type === 'audio') {
        // Remove audio and video players
        remove = players.filter(function(player) {
            var type = player.get('type').toLowerCase();
            return type === 'audio' || type === 'video';
        });
    } else if (type === 'picture') {
        // Remove picture and video players
        remove = players.filter(function(player) {
            var type = player.get('type').toLowerCase();
            return type === 'picture' || type === 'video';
        });
    }

    _.each(remove, function(player) {
        destroyPlayer(player.id);
    });

    players.add(player);
};

/**
 * Turns off and removes a player from the collection
 */
function destroyPlayer(id) {
	var player = players.get(id);
	if(player) {
		player.turnOff();
		players.remove(player);	
	}
};

// Notifications

/**
 * when a player is stopped
 */
app.vent.on('player:onstop', function(id) {
	if(!id) {
		// If no player is specified, remove all
		players.forEach(function(player) {
			destroyPlayer(player.id);
		});
	} else {
		// If the player is specified, remove it
		destroyPlayer(id);
	}
});

/**
 * When an item is played from THIS app's playlist, manually stop the picture player.
 * This is required because the player is stopped on xbmc but no notification is received 
 */
app.vent.on('playlist:open', function(data) {
    if(data.playlist.get('type') !== 'picture') {
    	var id = exports.getPlayerId('picture')

    	if(players.get(id)) app.vent.trigger('player:onstop', id);
    }
});

/**
 * on Media center play/pause
 */
app.vent.on('xbmc:player:onplay xbmc:player:onpause', function(data) {
	// Get the player
    exports.loading = exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	if(player.isCurrentItem(data.item)) {
	    		// if the player is already playing the current item, just update the speed
	    		player.set('speed', data.player.speed);
	    		return player;
	    	} else {
	    		// if the player is playing a different item, refresh it
	    		return fetchPlayerFromServer(player.id);
	    	}
	    })
	    .done();
});

/**
 * when an item is unloaded from the player (without stopping it)
 */
app.vent.on('xbmc:playlist:onclear', function(data) {
    app.vent.trigger('player:onstop', data.playlistid);
});

/**
 * when an item is stopped
 */
app.vent.on('xbmc:player:onstop', function(data) {
	if(!data.player) data.player = {};

	app.vent.trigger('player:onstop', data.player.playerid);
});

/**
 * when the current time is changed in the played item
 */
app.vent.on('xbmc:player:onseek', function(data) {
    
    exports.loading = exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	player.set('time', data.player.time);
	    })
	    .done();
});

/**
 * when the player speed is changed (fast forward) 
 */
app.vent.on('xbmc:player:onspeedchanged', function(data) {
    
    exports.loading = exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	// If the speed was actually changed, refresh the player to sync the time
	    	if(player.get('speed') !== data.player.speed) {
	    		return exports.loadPlayerDetails(player);	
	    	}
	    })
	    .done();
});
