var Movie = require('models/movie');
var app = require('app');

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

    comparator: function(movie1, movie2) {
        var movie1Label = movie1.get('label');
        var movie2Label = movie2.get('label');

        var result = movie1Label < movie2Label ? -1 : movie1Label > movie2Label ? 1 : 0;
        var sortSettings = app.controller('settings').mediaSettings.getSortSettings();
        var ascending = sortSettings['movies_order'];
        return result * (ascending ? 1 : (-1));
    }
});