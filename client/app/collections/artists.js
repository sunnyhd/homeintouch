var Artist = require('models/artist');

var Artists = module.exports = Backbone.Collection.extend({

    model: Artist,

    url: '/api/artists',

    comparator: function(artist) {
        return artist.get('label');
    }

});