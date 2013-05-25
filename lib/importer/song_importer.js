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
	list: {
		method: 'AudioLibrary.GetSongs',
		responseField: 'songs',
		properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid']
	},
	item: {
		method: 'AudioLibrary.GetSongDetails',
		responseField: 'songdetails',
		properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid'] 
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
		console.log('Persisting to DB ' + this.itemToString(item));

		var itemFilter = this.buildFilterForChildren(item);

	    var self = this;

		this.config.Model.findOne(itemFilter, function(error, oldSong) {
			var promise = Promise.withCallback();

			if (!oldSong) {
				// First time the album is saved

				// Save item in cache
			    var instance = new self.config.Model(item);

			    // Call Mongoose
			    instance.save(promise.cb);
			} else {

				if (oldSong.label === item.label) {
					// Trying to save the same album twice
					var albumidArray = oldSong.albumid.concat(item.albumid);
					oldSong.albumid = albumidArray;
					self.config.Model.update(oldSong, promise.cb);
				} else {
					promise = Promise.fail('Same SongId: ' + item.songid + ', but different Label: ' + oldSong.label + " - " + item.label);
				}
			}

			return promise.fail(function(error) {
				throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(error);
			});
			
		});

	}
});

module.exports = new SongImporter(config);