var app = require('app');
var Artists = require('collections/artists');
var mediaViews = require('views/media');

exports.artists = new Artists();

exports.showArtistList = function() {
    var view = new mediaViews.ArtistLayout({ collection: exports.artists });
    app.main.show(view);
};