var paginated = require('lib/paginated');
var Movie = require('models/movie');

var Movies = module.exports = Backbone.Collection.extend({

    model: Movie,

    url: '/api/movies'

});

paginated.call(Movies.prototype, { key: 'movies' });