var moviesController = require('controllers/movies');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/movie_detail'),

    events: {
        'click .close': 'close',
        'click .play': 'play',
        'click .playlist': 'playlist',
        'click .resume': 'resume'
    },

    play: function() {
        moviesController.play(this.model);
        this.close();
    },

    playlist: function() {
        moviesController.addToPlaylist(this.model);
    },

    resume: function() {
        moviesController.resume(this.model);
        this.close();
    }

});