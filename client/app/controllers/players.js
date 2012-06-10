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

exports.selectPlayer = function(player) {
    players.select(player);
};

exports.stopPlayer = function(player) {
    player.destroy();
    exports.selectPlayer(null);
};

// Events
// ---------------

exports.players.on('select', function(player) {
    if (player) {
        var view = new mediaViews.PlayerView({ model: player });
        app.main.show(view);

        player.fetch();
    } else {
        app.main.close();
    }

    //poll(player);
});

// Helpers
// ---------------

var timeout;
var poll = function(player) {
    var run = function() {
        player.fetch();
        timeout = setTimeout(run, 1000);
    };

    clearTimeout(timeout);
    run();
};