var Importer = require('./importer');
var Promise = require('../promise');

var songImporter = require('./song_importer');

var Album = require('../../app/models/album');

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
	}
});

module.exports = new AlbumImporter(config);
