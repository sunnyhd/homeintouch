var ArtistItemView = require('views/music/artist_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/artist_list'),
    
    itemView: ArtistItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.artists').append(iv.el);
    },

    matchers: function(artist) {
        return artist.get('label');
    }
    
});