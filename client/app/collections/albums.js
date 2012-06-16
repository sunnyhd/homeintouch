var paginated = require('lib/paginated');
var Album = require('models/album');

var Albums = module.exports = Backbone.Collection.extend({

    model: Album,

    url: '/api/albums'

});

paginated.call(Albums.prototype, { key: 'albums' });