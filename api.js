var lastfm = require('./lib/scrappers/lastfm_music_scapper');

lastfm.getArtistImage('aerosmith')
    .then(function(url) {
        console.log(url);  
    })
    .fail(function(err) {
         console.log(err);
    })
    .done();

lastfm.getAlbumImage('aerosmith', 'O, Yeah! Ultimate Aerosmith Hits')
    .then(function(url) {
        console.log(url);  
    })
    .fail(function(err) {
         console.log(err);
    })
    .done();