module.exports = Backbone.Router.extend({
    
    routes: {
        '': 'home',
        'home': 'home',
        'players': 'players',
        'playlists': 'playlists',
        'movies': 'movies'
    },

    initialize: function(options) {
        this.app = options.app;
    },
    
    home: function() {
        this.app.closeRegions();
        var home = this.app.controller('homes').showCurrent();
        var floor = this.app.controller('floors').showFloors(home);
    },

    players: function() {
        this.app.closeRegions();
        this.app.controller('players').showPlayers();
    },

    playlists: function() {
        this.app.closeRegions();
        this.app.controller('playlists').showPlaylists();
    },
    
    movies: function() {
        this.app.closeRegions();
        this.app.controller('movies').showMovieList();
        this.app.controller('movies').movies.fetch();
    }
    
});