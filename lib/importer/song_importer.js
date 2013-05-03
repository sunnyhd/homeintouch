var Importer = require('./importer');

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
		responseField: 'songs'
	},
	item: {
		method: 'AudioLibrary.GetSongDetails',
		responseField: 'songdetails',
		properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid'] 
	}
};

// Creates the importer instance with the appropriate configuration
module.exports = new Importer(config);