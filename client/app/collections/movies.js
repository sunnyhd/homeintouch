var Movie = require('models/movie');

var Movies = module.exports = Backbone.Collection.extend({

    model: Movie,

    url: '/api/movies',

    comparator: function(movie) {
        return movie.get('label');
    }

});