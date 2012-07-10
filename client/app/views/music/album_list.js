var AlbumItemView = require('views/music/album_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/album_list'),
    
    itemView: AlbumItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.albums').append(iv.el);
    }
    
});