var Movie = require('models/movie');

module.exports = Backbone.Collection.extend({

    model: Movie,

    url: '/api/movies'

});