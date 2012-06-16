var paginated = require('lib/paginated');
var Artist = require('models/artist');

var Artists = module.exports = Backbone.Collection.extend({

    model: Artist,

    url: '/api/artists'

});

paginated.call(Artists.prototype, { key: 'artists' });