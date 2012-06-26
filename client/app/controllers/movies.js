var app = require('app');
var Movies = require('collections/movies');
var Player = require('models/player');
var MovieListView = require('views/movies/movie_list');
var playlistsController = require('controllers/playlists');

exports.movies = new Movies();

exports.showMovieList = function() {
    var view = new MovieListView({ collection: exports.movies });
    app.main.show(view);
};

exports.play = function(movie) {
    movie.play();
};

exports.resume = function(movie) {
    movie.play().then(function() {
        var playerid = playersController.getPlayerId('video');
        var player = new Player({ playerid: playerid });
        var resume = movie.get('resume');

        var command = player.seekCommand(resume.position / resume.total);
        command.send();
    });
};

exports.addToPlaylist = function(movie) {
    playlistsController.addToPlaylist('video', { movieid: movie.id });
};