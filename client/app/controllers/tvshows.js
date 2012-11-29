var app = require('app');
var Episodes = require('collections/episodes');
var TVShows = require('collections/tvshows');
var TVShow = require('models/tvshow');
var EpisodeListView = require('views/tvshows/episode_list');
var TVShowContainerView = require('views/tvshows/tvshow_container');
var TVShowEpisodeListView = require('views/tvshows/tvshow_episode_list');
var MediaConfigurationOptionsView = require('views/settings/media_configuration_options');
var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');

exports.showTVShowList = function() {

    updateNavs();
    updateConfigurationOptions();

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

    updateConfigurationOptions();

    var tvshow = new TVShow({ tvshowid: tvshowid });

    var successCallback = function(model) {
        updateTvShowNavs(model.get('tvshowid'), model.get('label'));
        var view = new TVShowEpisodeListView({ model: tvshow });
        app.main.show(view);
    }

    tvshow.fetch({success: successCallback});
    
    return tvshow;
};

exports.showEpisodeList = function() {

    updateNavs();
    updateConfigurationOptions();

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
};

function updateTvShowNavs (tvShowId, tvShowName) {
     $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
        name: tvShowName, 
        handler: function(e) {
            app.router.navigate(('#tvshows/' + tvShowId), {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: tvShowName, 
        previous: 'TV Shows',
        handler: function(e) {
            app.router.navigate('#tvshows', {trigger: true});
            return false;
        }
    });
};

function updateConfigurationOptions () {
    app.desktopTopConfig.show(new MediaConfigurationOptionsView());
    app.touchBottomConfig.show(new MediaConfigurationOptionsView());
}