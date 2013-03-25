var app = require('app');

var Episodes = require('collections/episodes');
var TVShows = require('collections/tvshows');
var Seasons = require('collections/seasons');

var TVShow = require('models/tvshow');
var Season = require('models/season');

var SeasonEpisodeListView = require('views/tvshows/season_episode_list');
var TVShowContainerView = require('views/tvshows/tvshow_container');
var TVShowSeasonListView = require('views/tvshows/tvshow_season_list');
var MediaConfigurationOptionsView = require('views/settings/media_configuration_options');

var playersController = require('controllers/players');
var playlistsController = require('controllers/playlists');

exports.shows = new TVShows();
exports.loading = null; // Holds the promise reference to the previous collection

exports.filters = {};
exports.filters.genres = null;
exports.filters.episodeLabels = null;

exports.showTVShowList = function() {

    exports.loading.done(function() {

        updateNavs();
        updateConfigurationOptions();

        _.each(exports.shows.models, function(model) {
            model.set('episodes', new Episodes(exports.filters.episodeLabels[model.get('tvshowid')]));
        });

        var view = new TVShowContainerView({ collection: exports.shows });
        app.main.show(view);
    });

    return exports.shows;
};

exports.showTVShowSeasonList = function(tvshowid) {

    updateConfigurationOptions();

    var tvshow = new TVShow({ tvshowid: tvshowid });

    var successCallback = function(model) {
        updateTvShowNavs(model.get('tvshowid'), model.get('label'));
        var view = new TVShowSeasonListView({ model: tvshow });
        app.main.show(view);
    }

    tvshow.fetch({success: successCallback});
    
    return tvshow;
};

exports.showSeasonEpisodeList = function(tvshowid, season) {

    var season = new Season({ tvshowid: tvshowid, season: season });

    var successCallback = function(model) {
        updateSeasonNavs(model.get('tvshowid'), model.get('season'), model.get('showtitle'), model.get('label'));
        var view = new SeasonEpisodeListView({ model: season });
        app.main.show(view);
    }

    season.fetch({success: successCallback});
}

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
    // Removes previous link texts
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html('');
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');
    
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
    // Removes previous link texts
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html('');
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

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

function updateSeasonNavs (tvShowId, season, tvShowName, seasonName) {
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'inner-room',
        name: seasonName, 
        handler: function(e) {
            app.router.navigate(('#tvshows/' + tvShowId + '/season/' + season), {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: seasonName, 
        previous: tvShowName,
        handler: function(e) {
            app.router.navigate(('#tvshows/' + tvShowId), {trigger: true});
            return false;
        }
    });
};

function updateConfigurationOptions () {
    app.desktopTopConfig.show(new MediaConfigurationOptionsView());
    app.touchBottomConfig.show(new MediaConfigurationOptionsView());
};

app.vent.on('sort-media-collections', function(){
    exports.shows.sort();
});