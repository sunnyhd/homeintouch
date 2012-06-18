var PlaylistItemView = require('views/music/playlist_item');

module.exports = Backbone.Marionette.CompositeView.extend({

    template: require('templates/music/playlist_list'),

    itemView: PlaylistItemView,

    appendHtml: function(cv, iv) {
        this.$('.items').append(iv.el);
    }

});