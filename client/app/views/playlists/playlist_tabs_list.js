var PlaylistTabsItemView = require('views/playlists/playlist_tabs_item');
var PlaylistListView = require('views/playlists/playlist_list');

module.exports = Backbone.Marionette.CompositeView.extend({
	itemView: PlaylistTabsItemView,
    template: require('templates/playlists/playlist_tabs_list'),

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

            //TODO Change this!!
            this.contentRegion.close();
            this.contentRegion = new Backbone.Marionette.Region({
			  el: "#playlist-content"
		});
            this.contentRegion.show(view);
        }
    }

});