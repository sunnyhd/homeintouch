var Movie = require('models/movie');

var Movies = module.exports = Backbone.Collection.extend({

    model: Movie,

    url: '/api/movies',

    initialize: function(opts) {
    	opts || (opts = {});
    	if (opts.lastN) {
    		this.url = '/api/movies/last/' + opts.lastN;
    	}
    },

    setLastN: function(amount) {
        this.url = '/api/movies/last/' + amount;
    },

    clearLastN: function() {
        this.url = '/api/movies';
    },

    comparator: function(movie) {
        return movie.get('label');
    }

});