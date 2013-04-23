var app = require('app');
var Movies = require('collections/movies');
var Movie = require('models/movie');
var Player = require('models/player');
var MovieContainerView = require('views/movies/movie_container');
var homesController = require('controllers/homes');
var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');
var MovieDetailView = require('views/movies/movie_detail');
var MediaConfigurationOptionsView = require('views/settings/media_configuration_options');

exports.movies = new Movies();
exports.loading = null; // Holds the promise reference to the previous collection

// Filter for movies
exports.filters = {};
exports.filters.years = null;
exports.filters.genres = null;

// Show views

exports.showMovieCoverView = function() {

    exports.loading.done(function() {

        updateNavs();
        updateConfigurationOptions();
        var view = new MovieContainerView({ collection: exports.movies, mode: 'cover' });
        app.main.show(view);
    });
};

exports.showMovieListView = function() {

    exports.loading.done(function() {

        updateNavs();
        updateConfigurationOptions();
        var view = new MovieContainerView({ collection: exports.movies, mode: 'list' });
        app.main.show(view);
    });
};

exports.showMovieDetailView = function(id) {

    var movie = null;
    var def = new $.Deferred();
    var loadingMovie = def.promise();

    // Show the loading view
    app.showLoading(loadingMovie);

    // When the movie instace is loaded, displays its data
    loadingMovie.done(function() {
        updateNavForMovie(movie);
        updateConfigurationOptions();
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

exports.loadMovies = function(onlyFilters) {
     // Loads movie colletion, genres and years
    
    var loadingMovies = (onlyFilters)? true : exports.movies.fetch();
    var loadingGenres = $.get('/api/genres/movies').done(function(data) { exports.filters.genres = data; });
    var loadingYears  = $.get('/api/years/movies').done(function(data) { exports.filters.years = data; });

    // When the three sources were loaded
    exports.loading = $.when(loadingMovies, loadingGenres, loadingYears);
}

/**
 * Retrieves the movie by id, either from the client if it has already been loaded
 * or from the server
 */
exports.findMovie = function(id) {
    var movie = exports.movies.get(id);
    if(!movie) {
        movie = new Movie({ movieid: id });
        return Q.when(movie.fetch()).then(function() {
            exports.movies.add(movie);
            return movie;
        });
    }
    return Q.when(movie);
};

// Helper methods

function ensureHomeNav() {
    if (!homesController.currentHome) {
        var home = homesController.homes.defaultHome();
        homesController.setHomeData(home);
    }
}

function updateNavs() {
    ensureHomeNav();

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

function updateConfigurationOptions () {
    app.desktopTopConfig.show(new MediaConfigurationOptionsView());
    app.touchBottomConfig.show(new MediaConfigurationOptionsView());
}

function updateFiltersAndView(data, logAction) {
    exports.loadMovies(true);
    exports.loading.done(function () {
        app.vent.trigger('refresh-movie-views');
        console.log('Movie with id ' + data.id + ' ' + logAction);
     });
    
}

// Notifications
app.vent.on('sort-media-collections', function() {
    exports.movies.sort();
});

app.vent.on('xbmc:videolibrary:onupdate', function (data) {
    if (data.type && data.type === 'movie') {
        // Is the movie already loaded?
        var movie = exports.movies.get(data.id);

        if (!movie) {
            // If not add the client instance
            movie = new Movie({ movieid: data.id });
            exports.movies.add(movie);
        }
        // Load the movie info (or update if it already exists in the client)
        exports.loading = movie.fetch();

        exports.loading.done(function () {
            // When done, update the filters and the view
            updateFiltersAndView(data, 'added or updated');
        });
    }
});

app.vent.on('xbmc:videolibrary:onremove', function (data) {
    if (data.type && data.type === 'movie') {
        // Remove the movie from the collection
        exports.movies.remove(data.id);
        // Update the filters and the view
        updateFiltersAndView(data, 'removed');
    }
});
