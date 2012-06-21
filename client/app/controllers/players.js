var app = require('app');
var Players = require('collections/players');
var Player = require('models/player');
var PlayerTabsListView = require('views/players/player_tabs_list');
var PlayerView = require('views/players/player');

var players = exports.players = new Players();

exports.showPlayers = function() {
    app.main.close();

    var view = new PlayerTabsListView({ collection: players });
    app.subnav.show(view);

    players.fetch().then(function() {
        var player = players.getSelected() || players.getDefault();
        exports.selectPlayer(player);
    });
};

exports.selectPlayer = function(player, options) {
    var current = players.getSelected();

    if (current) {
        current.shutdown();
    }

    players.select(player, options);
};

exports.stopPlayer = function(player) {
    player.destroy();

    var selected = players.getSelected();

    if (selected && selected.id === player.id) {
        exports.selectPlayer(null);
    }
};

exports.pausePlayer = function(player) {
    player.togglePlaying();

    var command = player.playPauseCommand();

    command.send().then(function() {
        player.set('speed', command.get('speed'));
    });
};

exports.shutdown = function() {
    exports.selectPlayer(null, { silent: true });
};

// Events
// ---------------

exports.players.on('select', function(player) {
    if (player) {
        var view = new PlayerView({ model: player });
        app.main.show(view);

        player.fetch();
        player.run();
    } else {
        app.main.close();
    }
});

app.vent.on('xbmc:player:onplay xbmc:player:onpause', function(data) {
    var player = players.get(data.player.playerid);

    if (player) {
        // Set player speed
        player.set('speed', data.player.speed);
    } else {
        // Fetch player
        var player = new Player({ playerid: data.player.playerid });

        player.fetch().then(function() {
            players.add(player);
        });
    }
});

app.vent.on('xbmc:player:onstop', function(data) {
    // TODO: Can there be more than 1 player?
    // Why doesn't the data include a playerid

    var player = players.getSelected();

    if (player) {
        players.remove(player);
        players.select(null);
    }
});