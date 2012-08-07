var app = require('app');
var TVShows = require('collections/tvshows');
var TVShowListView = require('views/tvshows/tvshow_list');

exports.showTvShows = function() {
    var shows = new TVShows();
    var view = new TVShowListView({ collection: shows });
    app.main.show(view);
    return shows;
};