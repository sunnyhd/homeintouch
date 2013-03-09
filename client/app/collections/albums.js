var Album = require('models/album');

var Albums = module.exports = Backbone.Collection.extend({

    model: Album,

    url: '/api/albums',

    initialize: function(opts) {
    	opts || (opts = {});
    	if (opts.lastN) {
    		this.url = '/api/albums/last/' + opts.lastN;
    	}
    },

    setLastN: function(amount) {
        this.url = '/api/albums/last/' + amount;
    },

    clearLastN: function() {
        this.url = '/api/albums';
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

        return new Albums(items);
    },

    comparator: function(album) {
        return album.get('label');
    }

});