var app = require('app');
var Artists = require('collections/artists');
var ArtistListView = require('views/music/artist_list');

exports.artists = new Artists();

exports.showArtistList = function() {
    var view = new ArtistListView({ collection: exports.artists });
    app.main.show(view);
};