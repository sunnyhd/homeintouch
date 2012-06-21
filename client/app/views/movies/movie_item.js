var moviesController = require('controllers/movies');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'movie',
    
    template: require('templates/movies/movie_item'),

    events: {
        'click a.add-to-playlist': 'addToPlaylist',
        'click a.play': 'play'
    },

    addToPlaylist: function(e) {
        e.preventDefault();
        moviesController.addToPlaylist(this.model);
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    }
    
});