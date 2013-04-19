var PlayerView = require('views/players2/player');
var playersController = require('controllers/players2');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerView,

    initialize: function() {
        this.bindTo(this.collection, 'change', this.render, this);
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