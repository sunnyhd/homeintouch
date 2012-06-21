var app = require('app');
var Players = require('collections/players');
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
    exports.selectPlayer(null);
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