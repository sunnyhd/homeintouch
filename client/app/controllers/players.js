var app = require('app');
var Players = require('collections/players');
var mediaViews = require('views/media');

var players = exports.players = new Players();

exports.showPlayers = function() {
    app.main.close();

    var view = new mediaViews.PlayersLayout({ collection: players });
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

exports.shutdown = function() {
    exports.selectPlayer(null, { silent: true });
};

// Events
// ---------------

exports.players.on('select', function(player) {
    if (player) {
        var view = new mediaViews.PlayerView({ model: player });
        app.main.show(view);

        player.fetch();
        player.run();
    } else {
        app.main.close();
    }
});