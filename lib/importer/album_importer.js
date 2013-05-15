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
	list: {
		method: 'AudioLibrary.GetAlbums',
		responseField: 'albums',
		properties: ['artist', 'artistid', "playcount", "genre", "rating", "thumbnail", "year", "mood", "style", "type"] 
	},
	item: {
		method: 'AudioLibrary.GetAlbumDetails',
		responseField: 'albumdetails',
		properties: ['artist', 'artistid', "playcount", "genre", "rating", "thumbnail", "year", "mood", "style", "type"] 
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
 	 * Persist the item to the DB
 	 */
	persistItem: function(item) {
		console.log('Persisting to DB ' + this.itemToString(item));

		var itemFilter = this.buildFilterForChildren(item);

	    var self = this;

		this.config.Model.findOne(itemFilter, function(error, oldAlbum) {
			var promise = Promise.withCallback();

			if (!oldAlbum) {
				// First time the album is saved

				// Save item in cache
			    var instance = new self.config.Model(item);

			    // Call Mongoose
			    instance.save(promise.cb);

			    return promise.fail(function(err) {
					throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(err);
				});
			} else {

				if (oldAlbum.label === item.label) {
					// Trying to save the same album twice
					var artistidArray = oldAlbum.artistid.concat(item.artistid);
					oldAlbum.artistid = artistidArray;
					self.config.Model.update(oldAlbum, promise.cb);
				} else {
					return promise.fail(function(err) {
						throw 'Problem while persisting ' + self.itemToString(item) + ': Same AlbumId: ' + item.albumid + ', but different Label: ' + item.label;
					});
				}
			}

			return promise.fail(function(error) {
				throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(error);
			});
			
		});

	}
});

module.exports = new AlbumImporter(config);
