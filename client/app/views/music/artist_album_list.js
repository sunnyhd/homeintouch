var AlbumItemView = require('views/music/artist_album_item_container');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/artist_album_list'),
    
    itemView: AlbumItemView,

    initialize: function() {
        this.collection = this.model.albums;
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.albums').append(iv.el);
    },

    matchers: function(album) {
        return album.get('label');
    }
    
});