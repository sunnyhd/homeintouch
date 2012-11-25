var app = require('app');
var Movies = require('collections/movies');
var Movie = require('models/movie');
var Player = require('models/player');
var MovieContainerView = require('views/movies/movie_container');
var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');
var MovieDetailView = require('views/movies/movie_detail');

exports.movies = new Movies();


// Show views

exports.showMovieCoverView = function() {
    updateNavs();
    var view = new MovieContainerView({ collection: exports.movies, mode: 'cover' });
    app.main.show(view);
};

exports.showMovieListView = function() {
    updateNavs();
    var view = new MovieContainerView({ collection: exports.movies, mode: 'list' });
    app.main.show(view);
};

exports.showMovieDetailView = function(id) {

    var movie = null;
    var def = new $.Deferred();
    var loadingMovie = def.promise();

    // When the movie instace is loaded, displays its data
    loadingMovie.done(function() {
        updateNavForMovie(movie);
        var view = new MovieDetailView({ model: movie });
        app.main.show(view);
    });

    // If the collection is loaded
    if (!_.isUndefined(exports.movies) && exports.movies.models.length > 0) {
        movie = exports.movies.get(id);
        def.resolve();

    // If not, loads the movie isntance
    } else {
        movie = new Movie ( { 'movieid': id } );
        movie.fetch().done(function() {
            def.resolve();
        });
    }
};


// Actions

exports.play = function(movie) {
    movie.play();
};

exports.resume = function(movie) {
    movie.play().then(function() {
        var playerid = playersController.getPlayerId('video');
        var player = new Player({ playerid: playerid });

        var command = player.seekCommand(movie.getResumePercentage());
        command.send();
    });
};

exports.addToPlaylist = function(movie) {
    playlistsController.addToPlaylist('video', { item: { movieid: movie.id }});
};


// Helper methods

function updateNavs() {
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts

    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'Movies', 
        handler: function(e) {
            app.router.navigate('#movies', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'Movies', 
        previous: 'Home',
        handler: function(e) {
            app.router.navigate('', {trigger: true});
            return false;
        }
    });
}

function updateNavForMovie (movie) {
    updateNavs();

    var movieLabel = movie.get('label');

    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
        name: movieLabel, 
        handler: function(e) {
            app.router.navigate('#movies', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: movieLabel, 
        previous: 'Movies',
        handler: function(e) {
            app.router.navigate('#movies', {trigger: true});
            return false;
        }
    });
}