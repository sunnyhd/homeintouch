var AlbumSongItemView = require('views/music/album_song_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/album_song_list'),
    
    itemView: AlbumSongItemView,

    initialize: function() {
        this.collection = this.model.songs;
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
    }
    
});