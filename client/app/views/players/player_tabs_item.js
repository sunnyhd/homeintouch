var playersController = require('controllers/players');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    template: require('templates/players/player_tabs_item'),

    events: {   
        'click a': 'playerClicked'
    },

    onRender: function() {
        this.$el.attr('data-playerid', this.model.id);
    },

    playerClicked: function(e) {
        e.preventDefault();
        playersController.activatePlayer(this.model);
    }

});