var PlaylistTabsItemView = require('views/music/playlist_tabs_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/music/playlist_tabs_list'),

    itemView: PlaylistTabsItemView,

    initialize: function(){
        this.bindTo(this.collection, 'select', this.render, this);
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
        }
    }

});