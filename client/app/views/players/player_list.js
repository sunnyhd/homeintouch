var PlayerView = require('views/players/player');
var PlayerCollection = require('collections/players');
var playersController = require('controllers/players');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerView,

    initialize: function() {
        this.bindTo(this.collection, 'activate', this.activated, this);
        this.bindTo(this.collection, 'deactivate', this.deactivated, this);
        
        // console.log('Initialization PlayerListView instance: ' + this.cid);
    },

    appendHtml: function(cv, iv) {
        this.$('.players').append(iv.el);
    },

    onClose: function() {
        // console.log('Closing PlayerListView instance: ' + this.cid);
        // playersController.close();
    },

    onShow: function() {
        console.log('Showing PlayerListView instance: ' + this.cid);
    },

    activated: function(player) {
        this.$('.players li[data-playerid=' + player.id + ']').addClass('active');
    },

    deactivated: function(player) {
        this.$('.players li[data-playerid=' + player.id + ']').removeClass('active');
    }

});