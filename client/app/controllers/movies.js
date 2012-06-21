var app = require('app');
var Movies = require('collections/movies');
var Playlists = require('collections/playlists');
var MovieListView = require('views/movies/movie_list');
var PlaylistsAddModalView = require('views/playlists/playlist_add_modal');

exports.movies = new Movies();

exports.showMovieList = function() {
    var view = new MovieListView({ collection: exports.movies });
    app.main.show(view);
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