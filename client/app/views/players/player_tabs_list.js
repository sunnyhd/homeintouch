var playersController = require('controllers/players');
var PlayerTabsItemView = require('views/players/player_tabs_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerTabsItemView,

    initialize: function() {
        this.bindTo(this.collection, 'activate', this.activated, this);
        this.bindTo(this.collection, 'deactivate', this.deactivated, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.players').append(iv.el);
    },

    onClose: function() {
        playersController.close();
    },

    activated: function(player) {
        this.$('.players li[data-playerid=' + player.id + ']').addClass('active');
    },

    deactivated: function(player) {
        this.$('.players li[data-playerid=' + player.id + ']').removeClass('active');
    }

});