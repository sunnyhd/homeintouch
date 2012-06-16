var AlbumItemView = require('views/music/album_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/artist_album_list'),
    
    itemView: AlbumItemView,

    events: {
        'click .prev': 'prevPage',
        'click .next': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.albums').append(iv.el);
    },

    prevPage: function(e) {
        e.preventDefault();
        this.collection.prevPage();
    },

    nextPage: function(e) {
        e.preventDefault();
        this.collection.nextPage();
    }
    
});