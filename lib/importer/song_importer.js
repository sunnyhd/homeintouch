var Importer = require('./importer');
var Promise = require('../promise');

var Song = require('../../app/models/song');

/**
 * Converts an error to string in order to log
 */
function errorToString(err) {
	var result = JSON.stringify(err);
	if(result === '{}') return err;
	return result;
}

/**
 * Song import configuration 
 */
var config = {
	Model: Song,
	name: 'song',
	idField: 'songid',
	properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid', 'title', 'year', 'genre'],
	list: {
		method: 'AudioLibrary.GetSongs',
		responseField: 'songs',
		pageSize: 80
	},
	item: {
		method: 'AudioLibrary.GetSongDetails',
		responseField: 'songdetails'
	}
};

// Creates the importer instance with the appropriate configuration
var SongImporter = Importer.extend({
	init: function(config) {
		this._super(config);
	},

	loadItemDetails: function(item) {
		return Promise.resolve(item);
	},

	/**
 	 * Persist the item to the DB
 	 */
	persistItem: function(item) {
		//console.log('Persisting to DB ' + this.itemToString(item));

		var itemFilter = this.buildFilterForChildren(item);

	    var self = this;

	    // Checks if the song id was already persisted
	    return Promise.asPromise(this.config.Model, this.config.Model.findOne, itemFilter)
	    .then(function(oldSong) {
			var promise = Promise.withCallback();

			if (!oldSong) 
				return self.saveSong(item);
			else 
				return self.updateSong(oldSong, item);

	    })
	    .fail(function(error) {
			throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(error);
		});
	},

	/**
	 * Saves a song to DB for the first time. 
	 */
	saveSong: function(song) {
		// Save item in cache
	    var instance = new this.config.Model(song);

	    // Call Mongoose
	    var promise = Promise.asPromise(instance, instance.save);

		var self = this;
	    // If song belongs to no album, we still need a "simples" album to navigate the app. XBMC actually creates the album
	    if(song.album === '') {
		    promise = promise.then(function() {
		    	return self.createSimplesAlbumForSong(song);
		    });
	    }

	    return promise;
	},

	/**
	 * Updates the song (adding the artist) if it's indeed the same song (determined by the title). Otherwise, it throws a error.
	 */
	updateSong: function(oldSong, newSong) {

		if (oldSong.title !== newSong.title) {
			return Promise.fail('Same SongId: ' + newSong.songid + ', but different Title: ' + oldSong.title + " - " + newSong.title);
		}

		var artistidArray = oldSong.artistid.concat(newSong.artistid);
		oldSong.artistid = artistidArray;
		
		return Promise.asPromise(this.config.Model, this.config.Model.update, oldSong);
	},

	/**
	 * Saves a 'Simples' album for the song to the DB in order to make it compatible with the app 
	 */
	createSimplesAlbumForSong: function(song) {
		var albumImporter = require('./album_importer');
		return albumImporter.createSimplesAlbumForSong(song);
	}
});

module.exports = new SongImporter(config);


