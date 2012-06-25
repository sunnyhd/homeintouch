var app = require('app');
var Players = require('collections/players');
var Player = require('models/player');
var PlayerTabsListView = require('views/players/player_tabs_list');
var PlayerView = require('views/players/player');

var players = exports.players = new Players();
var showing = false;

exports.showPlayers = function() {
    var view = new PlayerTabsListView({ collection: players });
    app.subnav.show(view);
    showing = true;

    players.fetch().then(function() {
        players.activate();
    });
};

exports.showPlayer = function(player) {
    var view = new PlayerView({ model: player });
    app.main.show(view);

    player.fetch();
};

exports.activatePlayer = function(player) {
    players.activate(player);
};

exports.stopPlayer = function(player) {
    players.deactivate(player);
    player.destroy();
    players.activate();
};

exports.pausePlayer = function(player) {
    player.togglePlaying();

    var command = player.playPauseCommand();

    command.send().then(function() {
        player.set('speed', command.get('speed'));
    });
};

exports.addPlayer = function(player) {
    players.add(player);
    promote(player);
};

exports.removePlayer = function(player) {
    players.remove(player);
    player.trigger('destroy');
    players.deactivate(player);
    promote(players.getDefault());
};

exports.close = function() {
    var player = players.getActive();

    if (player) {
        players.deactivate(player);
    }

    showing = false;
};

// Events
// ---------------

players.on('activate', function(player) {
    player.run();

    if (showing) {
        exports.showPlayer(player);
    }
});

players.on('deactivate', function(player) {
    player.shutdown();
});

// Notifications

app.vent.on('xbmc:player:onplay xbmc:player:onpause', function(data) {
    var player = players.get(data.player.playerid);

    if (player) {
        // Existing player, set speed
        player.set('speed', data.player.speed);
    } else {
        // Fetch new player, add to collection
        var player = new Player({ playerid: data.player.playerid });

        player.fetch().then(function() {
            exports.addPlayer(player);
        });
    }
});

app.vent.on('xbmc:player:onstop', function(data) {
    // TODO: Can there be more than 1 player?
    // Why doesn't the data include a playerid

    var player = players.getActive();

    if (player) {
        exports.removePlayer(player);
    }
});

// Helpers
// ---------------

// Activate the given player only if there
// is not already an active player.
function promote(player) {
    var active = players.getActive();

    if (!active) {
        players.activate(player);
    }
}