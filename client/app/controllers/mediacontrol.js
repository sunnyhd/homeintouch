var app = require('app');

// Views
var MediaControlHomeView = require('views/media/home');
var RemoteControlView = require('views/media/remote_control');

// Utils
var UtilsNavigation = require('utils/navigation');


exports.showHomeView = function() {

	UtilsNavigation.updateNavbar({ 
		title: 'Media Control', 
		action: '#media-control'
	});

    var view = new MediaControlHomeView();
    app.main.show(view);
};

exports.showRemoteControlView = function() {

	UtilsNavigation.updateNavbar( {
		title: 'Remote Control',
		action: '#media-control/remote'
	}, { 
		title: 'Media Control', 
		action: '#media-control'
	});

	var view = new RemoteControlView();
    app.main.show(view);
};

exports.showPlaylistsView = function() {

	UtilsNavigation.updateNavbar( {
		title: 'Playlists',
		action: '#media-control/playlists'
	}, { 
		title: 'Media Control', 
		action: '#media-control'
	});

	app.controller('playlists').showPlaylists();
};

exports.showPlayersView = function() {

	UtilsNavigation.updateNavbar( {
		title: 'Players',
		action: '#media-control/players'
	}, { 
		title: 'Media Control',
		action: '#media-control'
	});

	app.controller('players').showPlayersOnRegion( app.main );
};
