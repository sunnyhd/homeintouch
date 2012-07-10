var SongItemView = require('views/music/song_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/song_list'),
    
    itemView: SongItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
    }
    
});