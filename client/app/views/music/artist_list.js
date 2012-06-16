var ArtistItemView = require('views/music/artist_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/artist_list'),
    
    itemView: ArtistItemView,

    events: {
        'click .prev': 'prevPage',
        'click .next': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.artists').append(iv.el);
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