var app = require('app');
var Episodes = require('collections/episodes');
var TVShows = require('collections/tvshows');
var TVShow = require('models/tvshow');
var EpisodeListView = require('views/tvshows/episode_list');
var TVShowContainerView = require('views/tvshows/tvshow_container');
var TVShowEpisodeListView = require('views/tvshows/tvshow_episode_list');
var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');

exports.showTVShowList = function() {

    updateNavs();

    var shows = new TVShows();
    var view = new TVShowContainerView({ collection: shows });
    var that = this;

    var successCallback = function(collection) {
        _.each(collection.models, function(model) {
            model.set('episodes', new Episodes(that.data[model.get('tvshowid')]));
        });
    };
    
    $.get('/api/episodes/label')
    .done(function(data) {
        that.data = data;
        shows.fetch({success: successCallback});
        app.main.show(view);
    });

    return shows;
};

exports.showTVShowEpisodeList = function(tvshowid) {
    var tvshow = new TVShow({ tvshowid: tvshowid });
    var view = new TVShowEpisodeListView({ model: tvshow });
    app.main.show(view);
    return tvshow;
};

exports.showEpisodeList = function() {

    updateNavs();   

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

function updateNavs () {
     $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'TV Shows', 
        handler: function(e) {
            app.router.navigate('#tvshows', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'TV Shows', 
        previous: 'Home',
        handler: function(e) {
            app.router.navigate('', {trigger: true});
            return false;
        }
    });
}