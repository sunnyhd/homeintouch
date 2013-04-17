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
        'music/artists/cover-view': 'artists',
        'music/artists/list-view': 'artistsListView',
        'music/artists/:artistid': 'artistDetails',

        'music/albums': 'albums',
        'music/albums/:albumid': 'albumSongs',

        'music/songs': 'songs',
        
        'import': 'importSettings',

        'pictures/cover-view': 'pictures',
        'pictures/list-view': 'picturesListView',
        'pictures': 'pictures',

        'pictures/cover-view/file/*path': 'pictureCoverViewFile',
        'pictures/list-view/file/*path': 'pictureListViewFile',

        'pictures/cover-view/slideshow/*path': 'pictureCoverViewSlideshow',
        'pictures/list-view/slideshow/*path': 'pictureListViewSlideshow',

        'pictures/cover-view/*path': 'pictures',
        'pictures/list-view/*path': 'picturesListView',

        'pictures/*path': 'pictures',

        'tvshows': 'tvshows',
        'tvshows/:tvshowid': 'tvshowSeasons',
        'tvshows/:tvshowid/season/:season': 'seasonEpisodeList'
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
            this.app.controller('music').showArtistCoverView();
        },

        artistsListView: function() {
            this.app.controller('music').showArtistListView();
        },

        albums: function() {
            this.app.controller('music').showAlbumList();
        },

        songs: function() {
            this.app.controller('music').showSongList();
        },

        artistDetails: function(artistid) {
            this.app.controller('music').showArtistDetailsView(artistid);
        },

        albumSongs: function(albumid) {
            this.app.controller('music').showAlbumSongList(albumid);
        },

        importSettings: function() {
            this.app.controller('settings').showImport().fetch();
        },

        pictures: function(path) {
            this.app.controller('pictures').showPicturesCoverView(path);
        },

        picturesListView: function(path) {
            this.app.controller('pictures').showPicturesListView(path);
        },

        pictureCoverViewFile: function(path) {
            this.app.controller('pictures').showPictureDetailsView(path, 'cover-view');
        },

        pictureListViewFile: function(path) {
            this.app.controller('pictures').showPictureDetailsView(path, 'list-view');
        },

        pictureCoverViewSlideshow: function(path) {
            this.app.controller('pictures').showSlideshowView(path, 'cover-view');
        },

        pictureListViewSlideshow: function(path) {
            this.app.controller('pictures').showSlideshowView(path, 'list-view');
        },

        tvshows: function() {
            this.app.controller('tvshows').showTVShowList();
        },

        tvshowSeasons: function(tvshowid) {
            this.app.controller('tvshows').showTVShowSeasonList(tvshowid);
        },

        seasonEpisodeList: function(tvshowid, season) {
            this.app.controller('tvshows').showSeasonEpisodeList(tvshowid, season);
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