var AlbumItemView = require('views/music/album_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/album_list'),
    
    itemView: AlbumItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.albums').append(iv.el);
    },

    matchers: function(album) {
        return [
            album.get('label'),
            album.get('artist')
        ];
    }
    
});