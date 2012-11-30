var app = require('app');
var moviesController = require('controllers/movies');
var IframeModalView = require('views/movies/iframe_modal');
var MovieActionsView = require('views/movies/movie_actions');

module.exports = Backbone.Marionette.ItemView.extend({

    className: 'movie-detail',

    template: require('templates/movies/movie_detail'),

    events: {
        'click .close': 'close',
        'click a[data-action="play"]': 'play',
        'click a[data-action="add-to-playlist"]': 'playlist',
        'click a[data-action="resume"]': 'resume',
        'click a[data-action="play-trailer"]': 'playTrailer',
        'click a[data-action="watch-trailer"]': 'watchTrailer',
        'click a[data-action="imdb"]': 'imdb'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    onRender: function() {

        // Fanart background
        var fanArt = this.model.get('fanartid');
        var src = 'img/cinema-background.jpg';
        if (fanArt && fanArt !== '') {
            src = 'api/images/' + fanArt;
        }
        app.setBackgroundImg( src );

        // Actions icons for mobile devices
        var actionsView = new MovieActionsView( {model: this.model} );
        actionsView.on('play', this.play, this);
        actionsView.on('add-to-playlist', this.playlist, this);
        actionsView.on('resume', this.resume, this);
        actionsView.on('play-trailer', this.playTrailer, this);
        actionsView.on('watch-trailer', this.watchTrailer, this);
        actionsView.on('imdb', this.imdb, this);
        app.touchBottomContent.show(actionsView);

        // // Adds the trailer video player to the HTML
        // if (this.model.get('trailer')) {
        //     this.videoPlayerView = new IframeModalView({
        //         label: this.model.get('label'),
        //         src: this.model.get('trailer'),
        //         video: true,
        //         videoid: 'trailer-video-' + this.model.id
        //     });
        //     app.iframe.show(this.videoPlayerView);
        //     app.iframe.hideModal();
        // }
    },

    close: function() {
        app.removeBackgroundImg();
    },

    play: function() {
        moviesController.play(this.model);
    },

    playlist: function() {
        moviesController.addToPlaylist(this.model);
    },

    resume: function() {
        moviesController.resume(this.model);
    },

    playTrailer: function() {
        this.model.playTrailer();
    },

    // watchTrailer: function() {
    //     this.videoPlayerView.initVideoPlayer();
    //     app.iframe.showModal(this.videoPlayerView);
    // },

    watchTrailer: function() {
        var view = new IframeModalView({
            label: this.model.get('label'),
            src: this.model.get('trailer'),
            video: true,
            videoid: 'trailer-video-' + this.model.id
        });
        app.iframe.show(view);
    },

    imdb: function() {
        // var view = new IframeModalView({
        //     label: 'IMDB',
        //     src: 'http://www.imdb.com/title/' + this.model.get('imdbnumber')
        // });
        // app.iframe.show(view);

        app.newTab( 'http://www.imdb.com/title/' + this.model.get('imdbnumber') );
    }

});