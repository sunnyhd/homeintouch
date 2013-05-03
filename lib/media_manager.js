var Promise = require('./promise');
var EventEmitter = require('events').EventEmitter;

var tvShowImporter = require('./importer/tvshow_importer');
var seasonImporter = require('./importer/tvshow_season_importer');
var episodeImporter = require('./importer/tvshow_episode_importer');

var movieImporter = require('./importer/movie_importer');

var artistImporter = require('./importer/artist_importer');
var albumImporter = require('./importer/album_importer');
var songImporter = require('./importer/song_importer');


var mediaManager = module.exports = new EventEmitter();
mediaManager.state = 'idle';

/**
 * Imports all the media (Movies, TV Shows and Music)
 */
mediaManager.import = function() {
	if (mediaManager.state !== 'idle') return;

	console.log("Importing all media...");
	var start = Date.now();

	Promise.all([tvShowImporter.import(), movieImporter.import(), artistImporter.import()])
	.then(function(){
		var end = Date.now();
		console.log('FINISHED IMPORTING ALL MEDIA in ' + (end-start)/1000 + ' seconds!!');
		mediaManager.emit('done', end - start);
	})
	.fail(function(err) {
		console.log('Error while importing media: ' + err);
		mediaManager.emit('error', err);
		throw err;
	})
	.fin(function() {
		mediaManager.state = 'idle';
	})
	.done();
}

/**
 * Imports all the movies
 */
mediaManager.importMovies = function() {
	console.log("Importing movies...");

	movieImporter.import().done();
}

/**
 * Imports all the music
 */
mediaManager.importMusic = function() {
	console.log("Importing music...");

	artistImporter.import().done();
}

/**
 * Imports all the TV Shows
 */
mediaManager.importTVShows = function() {
	console.log("Importing TV Shows...");

	tvShowImporter.import().done();
}


/************************
 * 		NOTIFICATIONS	*
 ************************/

var methods = {
        'VideoLibrary.OnUpdate': 'add',
        'AudioLibrary.OnUpdate': 'add',
        'VideoLibrary.OnRemove': 'remove',
        'AudioLibrary.OnRemove': 'remove'
    };

/**
 * Handles media center notifications.
 * If a media item has been added or removed, process it and then send the notification to the client
 * If the notification is about something else, just send it with no processing
 */
mediaManager.onMediaCenterLibraryUpdate = function(data) {
	var op = methods[data.method];

    if (op) {
    	// For some reason, the notification parameter is different when updating and removing, so we need to use the valid one in each case.
        var item = (data.params.data.item) ? data.params.data.item : data.params.data;
       
        // Get the appropriate importer or fail if none if found
        var importer = getImporter(item.type);
        if(!importer) return Promise.fail('No importer found for media type ' + item.type);

        var promise;

        if(op === 'add') {
        	// Add item (and its children) to library
        	var importerItem = {};
        	importerItem[importer.config.idField] = item.id;
        	promise = importer.processItem(importerItem)
        } else {
        	// Remove item from library
        	promise = importer.removeItem(item.id);
        }

        return promise.then(function() {
        	// Build a new data object to remove inconsistency between the parameter for onUpdate and for onRemove
        	return {
                	method: data.method,
	                params: {
	                    data: item
	                }
	            };
        });

    } else {
    	// If the notification is about something else, just send it with no processing
    	return Promise.asPromise(data);
    }
}

/**
 * Returns the appropriate importer for the type or null if none is found
 */
function getImporter(type) {
	switch(type.toLowerCase()) {
		case 'movie': return movieImporter;
		case 'artist': return artistImporter;
		case 'album': return albumImporter;
		case 'song': return songImporter;
		case 'tvshow': return tvShowImporter;
		case 'season': return seasonImporter;
		case 'episode': return episodeImporter;
		default: return null;
	}
}