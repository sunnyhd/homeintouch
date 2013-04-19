var app = require('app');
var Players = require('collections/players2');
var Player = require('models/player2');
var PlayerList = require('views/players2/player_list');

var movieController = require('controllers/movies');

var players = exports.players = new Players();
exports.ids = {};

exports.getPlayerId = function(type) {
    return exports.ids[type];
};

exports.showPlayers = function() {
	exports.loadActivePlayers().then(function() {
		var view = new PlayerList({ collection: players });
		app.desktopNowPlaying.show(view);
	});
};

exports.close = function() {
    var player = players.getActive();

    if (player) {
        players.deactivate(player);
        player.turnOff();
    }

};

exports.loadActivePlayers = function() {
	return Q.when(players.fetch()).then(function() {

		var promises = players.map(function(player) {
			return exports.loadPlayerDetails(player);
		});
		return Q.all(promises);
	});
};

exports.loadPlayerDetails = function(player) {
	return Q.when(player.fetch({silent:true}))
		.then(function() {
			return loadPlayerItem(player.get("item"));
		})
		.then(function(item) {
			player.set("item", item, {silent: true});
			player.trigger('change');
			return player; 
		});
};

function loadPlayerItem(item) {
	var loader;
	switch(item.type) {
		case 'movie':
			loader = movieController.findMovie;
			break;
		case 'episode':
			loader = tvShowController.findEpisode;
			break;
		case 'song':
			loader = musicController.findSong;
			break;
	}

	return loader(item.id);
} 

exports.findPlayer = function(id) {
	var player = players.get(id);

    if (player) {
        // Existing player
        return Q.when(player);
    } else {
        // Fetch new player, add to collection
        var player = new Player({ playerid: id });

        return exports.loadPlayerDetails(player)
        		.then(function() {
		        	players.add(player);
		        	return player;
		        });
    }
}

// Notifications

app.vent.on('xbmc:player:onplay xbmc:player:onpause', function(data) {
    exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	player.set('speed', data.player.speed);
	    });
});

app.vent.on('xbmc:player:onstop', function(data) {
	if(!data.player || !data.player.playerid) {
		players.forEach(function(player) {
			player.turnOff();
			players.remove(player);	
		});
	} else {
		var player = players.get(data.player.playerid);
		if(player) {
			player.turnOff();
			players.remove(player);	
		}
	    
	}
});

app.vent.on('xbmc:player:onseek', function(data) {
    exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	player.set('time', data.player.time);
	    });
});

app.vent.on('xbmc:player:onspeedchanged', function(data) {
    exports.findPlayer(data.player.playerid)
	    .then(function(player) {
	    	exports.loadPlayerDetails(player);
	    	//player.set('speed', data.player.speed);
	    });
});
