var Player = require('models/player');

module.exports = Backbone.Collection.extend({

    model: Player,

    url: '/api/players',

    getDefault: function() {
        return this.at(0);
    },

    select: function(player, options) {
        options || (options = {});
        this.selected = player;

        if (!options.silent) {
            this.trigger('select', player);
        }
    },

    getSelected: function() {
        return this.selected;
    }

});