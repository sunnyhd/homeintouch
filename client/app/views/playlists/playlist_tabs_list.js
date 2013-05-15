var PlaylistTabsItemView = require('views/playlists/playlist_tabs_item');
var PlaylistListView = require('views/playlists/playlist_list');

module.exports = Backbone.Marionette.CompositeView.extend({

	itemView: PlaylistTabsItemView,

    template: require('templates/playlists/playlist_tabs_list'),

    templateOptions: require('templates/playlists/general_options'),

    events: {
        'click [data-action]': 'actionTriggered'
    },

	initialize: function(){
        this.bindTo(this.collection, 'select', this.render, this);

        this.contentRegion = new Backbone.Marionette.Region({
            el: "#playlist-content"
        });
	},

    appendHtml: function(cv, iv) {
        this.$('.playlists').append(iv.el);
    },

    onRender: function() {
        var selected = this.collection.getSelected();

        if (selected) {
            var type = selected.get('type');

            this.$('.playlists li').removeClass('active');
            this.$('.playlists li[data-type=' + type + ']').addClass('active');

            var view = new PlaylistListView({ model: selected, collection: selected.items });

            // TODO Change this!!
            this.contentRegion.close();
            this.contentRegion = new Backbone.Marionette.Region({
    			  el: "#playlist-content"
    		});
            this.contentRegion.show(view);

            // Cache the selected view
            this.selectedView = view;
        }
        
        this.addOptionButtons();

        this.$editOrder = this.$el.find('[data-action="edit-order"]');
        this.$editOrderFinish = this.$el.find('[data-action="edit-order-ok"]');
        this.$editOrderFinish.hide();
    },

    actionTriggered: function(e) {
        if (this.selectedView) {
            var action = $(e.currentTarget).data('action');
            
            if (action == 'edit-order') {
                this.$editOrder.hide();
                this.$editOrderFinish.show();
            } else if (action == 'edit-order-ok') {
                this.$editOrder.show();
                this.$editOrderFinish.hide();
            }
            this.selectedView.trigger(action);
        }
    },

    // Adds the options button as a li element
    addOptionButtons: function() {
        this.$el.find('ul.playlists').append( this.templateOptions.call(this) );
    }

});