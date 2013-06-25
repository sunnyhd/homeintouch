var Importer = require('./importer');
var Promise = require('../promise');

var songImporter = require('./song_importer');

var Album = require('../../app/models/album');

/**
 * Converts an error to string in order to log
 */
function errorToString(err) {
	var result = JSON.stringify(err);
	if(result === '{}') return err;
	return result;
}

/**
 * Album import configuration -> It calls the Song Importer
 */
var config = {
	Model: Album,
	name: 'album',
	idField: 'albumid',
	subImporter: songImporter,
	properties: ['artist', 'artistid', "playcount", "genre", "rating", "thumbnail", "year", "mood", "style", "type"],
	list: {
		method: 'AudioLibrary.GetAlbums',
		responseField: 'albums'
	},
	item: {
		method: 'AudioLibrary.GetAlbumDetails',
		responseField: 'albumdetails'
	}
};

// Creates the importer instance with the appropriate configuration
var AlbumImporter = Importer.extend({
	init: function(config) {
		this._super(config);
	},
	
	loadItemDetails: function(item) {
		return Promise.resolve(item);
	},

	/**
	 * Builds a 'Simples' album for the song
	 */
	getSimplesAlbum: function(song) {
		return {
		    "albumid": song.albumid,
		    "artist": song.artist,
		    "artistid": song.artistid,
		    "genre": song.genre,
		    "label": "Simples",
		    "mood": [
		        ""
		    ],
		    "playcount": 0,
		    "rating": 0,
		    "style": [
		        ""
		    ],
		    "thumbnail": "",
		    "type": "",
		    "year": 0
		}
	},

	/**
	 * Saves a 'Simples' album for the song to the DB in order to make it compatible with the app 
	 */
	createSimplesAlbumForSong: function(song) {
		return this.processItem(this.getSimplesAlbum(song));
	},

	/**
 	 * Persist the item to the DB
 	 */
	persistItem: function(item) {
		console.log('Persisting to DB ' + this.itemToString(item));

		var itemFilter = this.buildFilterForChildren(item);

	    var self = this;

	    return Promise.asPromise(this.config.Model, this.config.Model.findOne, itemFilter)
	    .then(function(oldAlbum) {
			var promise = Promise.withCallback();

			if (!oldAlbum)
				return self.saveAlbum(item);
			else
				return self.udpateAlbum(oldAlbum, newAlbum);
	    
	    })
	    .fail(function(error) {
			throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(error);
		});
	},

	/**
	 * Saves an album to DB for the first time. 
	 */
	saveAlbum: function(album) {
		// Save item in cache
	    var instance = new this.config.Model(album);

	    // Call Mongoose
	    return Promise.asPromise(instance, instance.save);
	},

	/**
	 * Updates the album (adding the artist) if it's indeed the same album (determined by the label). Otherwise, it throws a error.
	 */
	updateAlbum: function(oldAlbum, newAlbum) {

		if (oldAlbum.label !== newAlbum.label) {
			return Promise.fail('Same AlbumId: ' + newAlbum.albumid + ', but different Label: ' + oldAlbum.label + " - " + newAlbum.label);
		}

		var artistidArray = oldAlbum.artistid.concat(newAlbum.artistid);
		oldAlbum = oldAlbum.toObject();
		oldAlbum.artistid = artistidArray;
		
		return Promise.asPromise(self.config.Model, self.config.Model.update, oldAlbum);
	}
});

module.exports = new AlbumImporter(config);
