var MovieItemView = require('views/movies/movie_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/movies/movie_list'),
    
    itemView: MovieItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    }
    
});