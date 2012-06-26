var app = require('app');
var Movies = require('collections/movies');
var Playlists = require('collections/playlists');
var Player = require('models/player');
var MovieListView = require('views/movies/movie_list');
var PlaylistsAddModalView = require('views/playlists/playlist_add_modal');
var playersController = require('controllers/players');

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
    var playlists = new Playlists();
    playlists.fetch();

    var form = new PlaylistsAddModalView({ collection: playlists });
    form.on("save", function(playlistid) {
        var playlist = playlists.get(playlistid);

        if (playlist) {
            playlist.items.create({ movieid: movie.id });
        } else {
            alert('Invalid playlist');
        }
    });

    app.modal.show(form);
};