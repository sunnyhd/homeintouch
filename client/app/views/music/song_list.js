var SongItemView = require('views/music/song_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/song_list'),
    
    itemView: SongItemView,

    events: {
        'click .prev': 'prevPage',
        'click .next': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
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