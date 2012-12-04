var SongItemView = require('views/music/song_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/song_list'),
    
    itemView: SongItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
    },

    matchers: function(song) {
        return [
            song.get('label'),
            song.get('album'),
            song.get('artist')
        ];
    }
    
});