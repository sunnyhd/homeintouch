var playersController = require('controllers/players');
var PlayerTabsItemView = require('views/players/player_tabs_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/players/player_tabs_list'),

    itemView: PlayerTabsItemView,

    initialize: function(){
        this.bindTo(this.collection, 'select', this.render, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.players').append(iv.el);
    },

    onRender: function() {
        var selected = this.collection.getSelected();

        if (selected) {
            var type = selected.get('type');

            this.$('.players li').removeClass('active');
            this.$('.players li[data-type=' + type + ']').addClass('active');
        }
    },

    onClose: function() {
        playersController.shutdown();
    }

});