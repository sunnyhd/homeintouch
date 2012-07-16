var AlbumSongItemView = require('views/music/album_song_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/album_song_list'),
    
    itemView: AlbumSongItemView,

    initialize: function() {
        this.collection = this.model.songs;
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
    },

    matchers: function(song) {
        return song.get('label');
    }
    
});