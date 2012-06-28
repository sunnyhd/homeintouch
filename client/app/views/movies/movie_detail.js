var moviesController = require('controllers/movies');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/movie_detail'),

    events: {
        'click .close': 'close',
        'click .play': 'play',
        'click .playlist': 'playlist',
        'click .resume': 'resume',
        'click .trailer': 'trailer'
    },

    play: function() {
        moviesController.play(this.model);
        this.close();
    },

    playlist: function() {
        moviesController.addToPlaylist(this.model);
        this.close();
    },

    resume: function() {
        moviesController.resume(this.model);
        this.close();
    },

    trailer: function() {
        this.model.playTrailer();
        this.close();
    }

});