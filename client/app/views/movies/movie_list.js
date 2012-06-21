var MovieItemView = require('views/movies/movie_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/movies/movie_list'),
    
    itemView: MovieItemView,

    events: {
        'click .prev': 'prevPage',
        'click .next': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
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