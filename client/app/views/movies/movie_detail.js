var app = require('app');
var moviesController = require('controllers/movies');
var IframeModalView = require('views/movies/iframe_modal');

module.exports = Backbone.Marionette.ItemView.extend({

    className: 'movie-detail',

    template: require('templates/movies/movie_detail'),

    events: {
        'click .close': 'close',
        'click .play': 'play',
        'click .playlist': 'playlist',
        'click .resume': 'resume',
        'click .play-trailer': 'playTrailer',
        'click .watch-trailer': 'watchTrailer',
        'click .imdb': 'imdb'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    onRender: function() {
        var fanArt = this.model.get('fanartid');
        var src = 'img/cinema-background.jpg';

        if (fanArt && fanArt !== '') {
            src = 'api/images/' + fanArt;
        }

        app.setBackgroundImg( src );
    },

    close: function() {
        app.removeBackgroundImg();
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

    playTrailer: function() {
        this.model.playTrailer();
        this.close();
    },

    watchTrailer: function() {
        this.close();

        var view = new IframeModalView({
            label: this.model.get('label'),
            src: this.model.get('trailer'),
            video: true
        });

        app.iframe.show(view);
    },

    imdb: function() {
        this.close();

        var view = new IframeModalView({
            label: 'IMDB',
            src: 'http://www.imdb.com/title/' + this.model.get('imdbnumber')
        });

        app.iframe.show(view);
    }

});