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
		        		song.thumbnailUrl = album.thumbnailUrl;
	        		}
	        	}
	        	
	        	songList.push(song);
	        }
        	res.json(songList);
        });
    });
};

exports.pages = function(req, res, next) {

    var songList = [];
    var songAlbumIdList = [];
    var pageSize = req.query.per_page;
    var pageNum = req.query.page;
    var skipAmount = pageSize * pageNum;
    var sortCriteria = req.query.sort;
    var queryFilter = {};

    if (req.query.filter) {
        
        var filter = JSON.parse(req.query.filter).filters;

        if (filter.genre) {
            queryFilter['genre'] = new RegExp(filter.genre);
        }

        if (filter.year) {
            var year = filter.year;
            if (year.indexOf('-') > 0) {
                var yearArray = year.split('-');
                queryFilter['year'] = {$gte: yearArray[0], $lte: yearArray[1]};
            } else {
                queryFilter['year'] = year;
            }
        }
    }

    console.log(JSON.stringify(queryFilter));

    var songStream = Song.find(queryFilter, [], {sort: {sortCriteria: 1}}).batchSize(10000).skip(skipAmount).limit(pageSize).stream();
    
    songStream.on('data', function(song) {

        songAlbumIdList.push(song.albumid);
        songList.push(song);
    });

    songStream.on('error', function(error) {
        return next(error);
    });

    songStream.on('close', function() {

        var result = [];
        Album.find({ albumid: {$in: songAlbumIdList} }, function(err, albums) {
            if (err) return next(err);

            for (var j = songList.length - 1; j >= 0; j--) {
                var song = songList[j];
                song = song.toObject();
                for (var i = albums.length - 1; i >= 0; i--) {
                    var album = albums[i].toObject();
                    if (album.albumid === song.albumid) {
                        song.thumbnailUrl = album.thumbnailUrl;
                    }
                }
                result.push(song);
            }
            res.json({data: result});
        });
    });
};

exports.getByAlbum = function(req, res, next) {

    var songList = [];
    var songStream = Song.find( { albumid: req.params.albumid } ).batchSize(10000).stream();

    songStream.on('data', function(song) {
        songList.push(song);
    });

    songStream.on('error', function(error) {
        return next(error);
    });

    songStream.on('close', function() {
        res.json(songList);
    });
};

exports.get = function(req, res, next) {
    Song.findOne( { songid: req.params.songid }, function(err, song) {
        if (err) return next(err);
        if (!song) return next(new Error('No such song'));
        
        Album.findOne({ albumid: song.albumid }, function(err, album) {
	        if (err) return next(err);
	        if (!album) return next(new Error('No such album'));

            song = song.toObject();
	        song.thumbnailUrl = album.thumbnailUrl;

	        res.json(song);
    	});
    });
};