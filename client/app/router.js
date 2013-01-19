module.exports = Backbone.Router.extend({
    
    routes: {
        '': 'startPage',
        'home': 'home',
        'players': 'players',
        'playlists': 'playlists',

        'movies': 'movies',
        'movies/cover-view': 'movies',
        'movies/list-view': 'moviesListView',
        'movies/details/:movieid': 'movieDetailView',

        'music': 'music',
        'music/artists': 'artists',
        'music/albums': 'albums',
        'music/songs': 'songs',
        'music/artists/:artistid': 'artistAlbums',
        'music/albums/:albumid': 'albumSongs',
        'import': 'importSettings',

        'pictures': 'pictures',
        'pictures/*path': 'pictures',

        'tvshows': 'tvshows',
        'tvshows/:tvshowid': 'tvshowEpisodes',
        'episodes': 'episodes'
    },

    handlers: {

        startPage: function() {
            this.app.controller('homes').startPage();
        },

        home: function() {
            var home = this.app.controller('homes').showCurrent();
        },

        players: function() {
            this.app.controller('players').showPlayers();
        },

        playlists: function() {
            this.app.controller('playlists').showPlaylists();
        },
        
        movies: function() {
            this.app.controller('movies').showMovieCoverView();
            // this.app.controller('movies').movies.fetch();
        },

        moviesListView: function() {
            this.app.controller('movies').showMovieListView();
            // this.app.controller('movies').movies.fetch();
        },

        movieDetailView: function(movieid) {
            this.app.controller('movies').showMovieDetailView(movieid);
        },

        music: function() {
            this.app.controller('music').showHomeView();
        },

        artists: function() {
            this.app.controller('music').showArtistList();
        },

        albums: function() {
            this.app.controller('music').showAlbumList().fetch();
        },

        songs: function() {
            this.app.controller('music').showSongList().fetch();
        },

        artistAlbums: function(artistid) {
            this.app.controller('music').showArtistAlbumList(artistid).fetch();
        },

        albumSongs: function(albumid) {
            this.app.controller('music').showAlbumSongList(albumid).fetch();
        },

        importSettings: function() {
            this.app.controller('settings').showImport().fetch();
        },

        pictures: function(path) {
            this.app.controller('pictures').showPictures(path).fetch();
        },

        tvshows: function() {

            this.app.controller('tvshows').showTVShowList();
        },

        tvshowEpisodes: function(tvshowid) {
            this.app.controller('tvshows').showTVShowEpisodeList(tvshowid);
        },

        episodes: function() {
            this.app.controller('tvshows').showEpisodeList().fetch();
        }
    },

    constructor: function() {
        var self = this;

        _.each(this.handlers, function(handler, method) {
            self[method] = function() {
                self.beforeFilter();
                return handler.apply(self, arguments);
            };
        });

        Backbone.Router.prototype.constructor.apply(this, arguments);
    },

    initialize: function(options) {
        this.app = options.app;
    },

    beforeFilter: function() {
        this.app.closeRegions();
    }
    
});