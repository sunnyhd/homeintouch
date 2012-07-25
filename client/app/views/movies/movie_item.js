var app = require('app');
var moviesController = require('controllers/movies');
var MovieDetailView = require('views/movies/movie_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'movie',
    
    template: require('templates/movies/movie_item'),

    events: {
        'click a.show': 'show'
    },

    show: function() {
        var view = new MovieDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});