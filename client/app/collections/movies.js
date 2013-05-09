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

    /**
     * It returns a new collection applying filters and sort parameters.
     */
    filterAndSortBy: function(opts) {

        // Ensures the filter and sort parameters
        opts.listType       || (opts.listType = 'all');
        opts.filters        || (opts.filters = {});
        opts.filters.genre  || (opts.filters.genre = '');
        opts.filters.year   || (opts.filters.year = '');
        opts.criteria       || (opts.criteria = '');

        var items = this.models;

        // Applies the list type filter
        if (opts.listType === 'recently-added') {
            items = _.first( _.sortBy(items, function(i) { return i.id; }) , 25);
        } else {
            // All items
        }

        // Applies the genre filter
        if (opts.filters.genre !== '') {
            items = _.filter(items, function(i) { return _.str.contains(i.get('genre'), opts.filters.genre); });
        }

        // Applies the year filter
        if (opts.filters.year !== '') {
            if (opts.filters.year.indexOf('-') > 0) {
                var yearArray = opts.filters.year.split('-');
                items = _.filter(items, function(i) { return ((i.get('year') >= yearArray[0]) && (i.get('year') <= yearArray[1])) });
            } else {
                items = _.filter(items, function(i) { return (i.get('year') == opts.filters.year) });
            }
        }

        // Search criteria
        if (opts.criteria !== '') {
            var regexp = new RegExp(opts.criteria, "i");

            items = _.filter(items, function(i) { 
                return regexp.test(i.get('label'));
            });
        }

        return new Movies(items);
    },

    comparator: function(movie1, movie2) {
        var movie1Label = movie1.get('label');
        var movie2Label = movie2.get('label');

        var result = movie1Label < movie2Label ? -1 : movie1Label > movie2Label ? 1 : 0;
        var ascending;

        //TODO For some reason mediasettings is sometimes undefined, temporal fix
        if(app.controller('settings').mediaSettings) {
            var sortSettings = app.controller('settings').mediaSettings.getSortSettings();
            ascending = sortSettings['movies_order'];
        } else {
            ascending = true;
        }
        return result * (ascending ? 1 : (-1));
    }
});