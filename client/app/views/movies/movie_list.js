var app = require('app');
var MovieItemView = require('views/movies/movie_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/movies/movie_list'),
    
    itemView: MovieItemView,

    appendHtml: function(cv, iv) {
        var movieStyleSettings = app.controller('settings').mediaSettings.getMovieStyleSettings();
        if (movieStyleSettings.hide_watched) {
            if (iv.model.get('playcount') === 0) {
                this.$('.movies').append(iv.el);
            }
        } else {
            this.$('.movies').append(iv.el);
        }
    },

    matchers: function(movie) {
        return movie.get('label');
    }
    
});