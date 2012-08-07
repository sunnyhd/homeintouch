var app = require('app');
var TVShows = require('collections/tvshows');
var TVShow = require('models/tvshow');
var TVShowListView = require('views/tvshows/tvshow_list');
var TVShowEpisodeListView = require('views/tvshows/tvshow_episode_list');

exports.showTVShowList = function() {
    var shows = new TVShows();
    var view = new TVShowListView({ collection: shows });
    app.main.show(view);
    return shows;
};

exports.showTVShowEpisodeList = function(tvshowid) {
    var tvshow = new TVShow({ tvshowid: tvshowid });
    var view = new TVShowEpisodeListView({ model: tvshow });
    app.main.show(view);
    return tvshow;
};