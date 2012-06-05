var app = require('app');
var Movies = require('collections/movies');
var Playlists = require('collections/playlists');
var mediaViews = require('views/media');

exports.movies = new Movies();

exports.showMovieList = function() {
    var view = new mediaViews.MovieLayout({ collection: exports.movies });
    app.main.show(view);
};

exports.addToPlaylist = function(movie) {
    var playlists = new Playlists();
    playlists.fetch();

    var form = new mediaViews.AddToPlaylistForm({ collection: playlists });
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