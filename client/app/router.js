module.exports = Backbone.Router.extend({
    
    routes: {
        '': 'home',
        'home': 'home',
        'movies': 'movies'
    },

    initialize: function(options) {
        this.app = options.app;
    },
    
    home: function() {
        var home = this.app.controller('homes').showCurrent();
        var floor = this.app.controller('floors').showFloors(home);
    },
    
    movies: function() {
        this.app.controller('media').showMediaMenu();
        this.app.controller('movies').showMovieList();
        this.app.controller('movies').movies.fetch();
    }
    
});