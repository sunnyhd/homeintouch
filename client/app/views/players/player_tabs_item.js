var playersController = require('controllers/players');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    template: require('templates/players/player_tabs_item'),

    events: {   
        'click a': 'playerClicked'
    },

    onRender: function() {
        this.$el.attr('data-type', this.model.get('type'));
    },

    playerClicked: function(e) {
        e.preventDefault();
        playersController.selectPlayer(this.model);
    }

});