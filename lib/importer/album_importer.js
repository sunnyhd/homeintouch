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
 	 * Persist the item to the DB
 	 */
	persistItem: function(item) {
		console.log('Persisting to DB ' + this.itemToString(item));

		var itemFilter = this.buildFilterForChildren(item);

	    var self = this;

	    return Promise.asPromise(this.config.Model, this.config.Model.findOne, itemFilter)
	    .then(function(oldAlbum) {
			var promise = Promise.withCallback();

			if (!oldAlbum) {
				// First time the album is saved

				// Save item in cache
			    var instance = new self.config.Model(item);

			    // Call Mongoose
			    instance.save(promise.cb);
			} else {

				if (oldAlbum.label === item.label) {
					// Trying to save the same album twice
					var artistidArray = oldAlbum.artistid.concat(item.artistid);
					oldAlbum = oldAlbum.toObject();
					oldAlbum.artistid = artistidArray;
					self.config.Model.update(oldAlbum, promise.cb);
				} else {
					promise = Promise.fail('Same AlbumId: ' + item.albumid + ', but different Label: ' + oldAlbum.label + " - " + item.label);
				}
			}

			return promise;
	    })
	    .fail(function(error) {
			throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(error);
		});

	}
});

module.exports = new AlbumImporter(config);
