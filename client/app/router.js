module.exports = Backbone.Router.extend({
    
    routes: {
        '': 'home',
        'home': 'home',
        'players': 'players',
        'playlists': 'playlists',
        'movies': 'movies',
        'artists': 'artists',
        'albums': 'albums',
        'songs': 'songs',
        'artists/:artistid': 'artistAlbums',
        'albums/:albumid': 'albumSongs'
    },

    handlers: {
        home: function() {
            var home = this.app.controller('homes').showCurrent();
            var floor = this.app.controller('floors').showFloors(home);
        },

        players: function() {
            this.app.controller('players').showPlayers();
        },

        playlists: function() {
            this.app.controller('playlists').showPlaylists();
        },
        
        movies: function() {
            this.app.controller('movies').showMovieList();
            this.app.controller('movies').movies.fetch();
        },

        artists: function() {
            this.app.controller('music').showArtistList().fetch();
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