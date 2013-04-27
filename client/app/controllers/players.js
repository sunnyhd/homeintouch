var app = require('app');
var Players = require('collections/players');
var Player = require('models/player');
var PlayerList = require('views/players/player_list');

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
 * Loads and shows the players in the dashboard
 */
exports.showPlayers = function() {
	exports.loadActivePlayers().then(function() {
		var view = new PlayerList({ collection: players });
		app.desktopNowPlaying.show(view);
	});
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
			return loadPlayerItem(player.get("item"));
		}, function(error) {
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
			console.log(JSON.stringify(e));
			throw e;
			//TODO see what to do if the item is not found 
		});
};

/**
 * Loads the played item details from the appropriate controller based on the type
 */
function loadPlayerItem(item) {
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
    destroyPlayer(data.playlistid);
});

/**
 * when an item is stopped
 */
app.vent.on('xbmc:player:onstop', function(data) {
	
	if(!data.player || !data.player.playerid) {
		// If no player is specified, remove all
		players.forEach(function(player) {
			destroyPlayer(player.id);
		});
	} else {
		// If the player is specified, remove it
		destroyPlayer(data.player.playerid);
	}
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
