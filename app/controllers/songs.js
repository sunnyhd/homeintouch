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

exports.get = function(req, res, next) {
    Song.findOne( { songid: req.params.songid }, function(err, song) {
        if (err) return next(err);
        if (!song) return next(new Error('No such song'));
        
        Album.findOne({ albumid: song.albumid }, function(err, album) {
	        if (err) return next(err);
	        if (!album) return next(new Error('No such album'));

	        song.year = album.year;
        	song.genre = album.genre;
        	song.thumbnailid = album.thumbnailid;
        	song.thumbnail = album.thumbnail;	

	        res.json(song);
    	});
    });
};