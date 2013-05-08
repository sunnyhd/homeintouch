var PlayerView = require('views/players/player');
var PlayerCollection = require('collections/players');
var playersController = require('controllers/players');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerView,

    initialize: function() {
        this.bindTo(this.collection, 'activate', this.activated, this);
        this.bindTo(this.collection, 'deactivate', this.deactivated, this);

        this.on('render', this.togglePlayers, this);
        this.bindTo(this.collection, 'add remove reset', this.togglePlayers, this);
        
        // console.log('Initialization PlayerListView instance: ' + this.cid);
    },

    appendHtml: function(cv, iv) {
        this.$('.players').append(iv.el);
    },

    togglePlayers: function() {
        var $noPlayers = this.$el.find('.no-players-container');
        var $players = this.$el.find('.players-list-container');

        if (this.collection.size() > 0) {
            $noPlayers.hide();
            $players.show();
        } else {
            $noPlayers.show();
            $players.hide();
        }
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