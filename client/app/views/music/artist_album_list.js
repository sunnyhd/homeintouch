var AlbumItemView = require('views/music/album_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/artist_album_list'),
    
    itemView: AlbumItemView,

    initialize: function() {
        this.collection = this.model.albums;
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.albums').append(iv.el);
    }
    
});