var app = require('app');
var Movies = require('collections/movies');
var mediaViews = require('views/media');

exports.movies = new Movies();

exports.showMovieList = function() {
    var view = new mediaViews.MovieLayout({ collection: exports.movies });
    app.main.show(view);
};