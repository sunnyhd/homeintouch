var Importer = require('./importer');
var albumImporter = require('./album_importer')
var Artist = require('../../app/models/artist');

/**
 * Artist import configuration -> It calls the Album importer
 */
var config = {
	Model: Artist,
	name: 'artist',
	idField: 'artistid',
	subImporter: albumImporter,
	properties: ['genre', 'description', 'thumbnail', 'fanart'], 
	list: {
		method: 'AudioLibrary.GetArtists',
		responseField: 'artists',
		pageSize: 100
	},
	item: {
		method: 'AudioLibrary.GetArtistDetails',
		responseField: 'artistdetails'
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);