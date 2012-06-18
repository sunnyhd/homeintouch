var playersController = require('controllers/players');

module.exports = Backbone.Marionette.ItemView.extend({

    className: 'player',

    template: require('templates/music/player'),

    events: {
        'click .stop': 'stopPlayer',
        'click .pause': 'pausePlayer'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    stopPlayer: function(e) {
        e.preventDefault();
        playersController.stopPlayer(this.model);
        this.remove();
    },

    pausePlayer: function(e) {
        e.preventDefault();
        playersController.pausePlayer(this.model);
    }

});