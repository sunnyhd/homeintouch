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
mediaManager.import = function(mediaType) {
	if (mediaManager.state !== 'idle') return;

	var start = Date.now();

	require('http').globalAgent.maxSockets = 100;

	importByMediaType(mediaType)
	.then(function(){
		var end = Date.now();
		console.info('FINISHED IMPORTING ALL MEDIA in ' + (end-start)/1000 + ' seconds!!');
		mediaManager.emit('done', end - start);
		require('http').globalAgent.maxSockets = 5;
	})
	.fail(function(err) {
		//console.log('Error while importing media: ' + err);
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
	console.info("Importing movies...");

	importByMediaType('movie').done();
}

/**
 * Imports all the music
 */
mediaManager.importMusic = function() {
	console.info("Importing music...");

	importByMediaType('music').done();
}

/**
 * Imports all the TV Shows
 */
mediaManager.importTVShows = function() {
	console.info("Importing TV Shows...");

	importByMediaType('tvshow').done();
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
        	promise = importer.importItem(importerItem)
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
    	return Promise.resolve(data);
    }
}

/**
 * Imports media by type, calling the appropriate importers and wait for them to finish.
 * If the media type is invalid, it will throw an error.
 */
function importByMediaType(mediaType) {
	// The media will determine the list of importers to call. 
	var importers = getImporters(mediaType);

	if (importers) {
		// Map each to a promise and wait for all of them to finish
		return Promise.all(importers.map(function(importer) { return importer.import(); }))
	} else {
		return Promise.fail('Invalid media name, it should be: music, movie, tvshow');
	}
}

/**
 * Returns the appropriate list of importers for the type or null if none is found
 */
function getImporters(type) {
	switch(type.toLowerCase()) {
		case 'movie': return [movieImporter];
		case 'music': return [artistImporter, albumImporter, songImporter];
		case 'artist': return [artistImporter];
		case 'album': return [albumImporter];
		case 'song': return [songImporter];
		case 'tvshow': return [tvShowImporter];
		case 'season': return [seasonImporter];
		case 'episode': return [episodeImporter];
		default: return null;
	}
}

/**
 * Returns the appropriate importer for the type or null if none is found
 */
function getImporter(type) {
	var importers = getImporters(type);
	if(!importers) return null;

	// Return the first importer in the list
	return importers[0];
}
