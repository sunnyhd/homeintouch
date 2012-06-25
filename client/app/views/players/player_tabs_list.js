var playersController = require('controllers/players');
var PlayerTabsItemView = require('views/players/player_tabs_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerTabsItemView,

    initialize: function() {
        this.bindTo(this.collection, 'activate deactivate', this.render, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.players').append(iv.el);
    },

    onRender: function() {
        this.$('.players li').removeClass('active');

        var active = this.collection.getActive();

        if (active) {
            this.$('.players li[data-playerid=' + active.id + ']').addClass('active');
        }
    },

    onClose: function() {
        playersController.close();
    }

});