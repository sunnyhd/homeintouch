var Importer = require('./importer');
var Promise = require('../promise');

var Song = require('../../app/models/song');

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
		return Promise.asPromise(item);
	}
});

module.exports = new SongImporter(config);