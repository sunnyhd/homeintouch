var Song = require('../models/song');
var Album = require('../models/album');

exports.index = function(req, res, next) {
    Song.find(function(err, songs) {
        if (err) return next(err);
        var songList = [];
        
    	Album.find(function(err, albums) {
        	if (err) return next(err);
        	for (var i = 0; i < songs.length; i++) {
    			var song = songs[i].toObject();
	        	for (var j = 0; j < albums.length; j++) {
	        		var album = albums[j].toObject();

	        		if (album.albumid === song.albumid) {
		        		song.year = album.year;
			        	song.genre = album.genre;
			        	song.thumbnailid = album.thumbnailid;
			        	song.thumbnail = album.thumbnail;	
	        		}
	        	}
	        	
	        	songList.push(song);
	        }
        	res.json(songList);
        });
    });
};