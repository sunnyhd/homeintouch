var Importer = require('./importer');
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
		responseField: 'albums'
	},
	item: {
		method: 'AudioLibrary.GetAlbumDetails',
		responseField: 'albumdetails',
		properties: ['artist', 'artistid', "playcount", "genre", "rating", "thumbnail", "year", "mood", "style"] 
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);