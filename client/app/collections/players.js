var Player = require('models/player');

module.exports = Backbone.Collection.extend({

    model: Player,
    loaded: false,
    url: '/api/players',

    fetch: function() {
        this.loaded = true;
        
        return Q.when(Backbone.Collection.prototype.fetch.call(this, arguments));
    },

    getDefault: function() {
        return this.at(0);
    },

    getActive: function() {
        return this.active;
    },

    activate: function(player) {
        if (!player) {
            player = this.getDefault();
        }

        if (this.active) {
            this.deactivate(this.active);
        }

        if (player) {
            this.active = player;
            this.trigger('activate', player);
        }

        return player;
    },

    deactivate: function(player) {
        var active = this.getActive();

        if (active && active.id === player.id) {
            this.active = null;
            this.trigger('deactivate', player);
        }
    }

});