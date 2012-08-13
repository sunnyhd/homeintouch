var app = require('app');
var Episodes = require('collections/episodes');
var TVShows = require('collections/tvshows');
var TVShow = require('models/tvshow');
var EpisodeListView = require('views/tvshows/episode_list');
var TVShowListView = require('views/tvshows/tvshow_list');
var TVShowEpisodeListView = require('views/tvshows/tvshow_episode_list');
var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');

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

exports.showEpisodeList = function() {
    var episodes = new Episodes();
    var view = new EpisodeListView({ collection: episodes });
    app.main.show(view);
    return episodes;
};

exports.play = function(episode) {
    episode.play();
};

exports.resume = function(episode) {
    var playerid = playersController.getPlayerId('video');
    episode.resume(playerid);
};

exports.addToPlaylist = function(episode) {
    playlistsController.addToPlaylist('video', { item: { episodeid: episode.id }});
};