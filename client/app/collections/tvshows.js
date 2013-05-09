var TVShow = require('models/tvshow');
var app = require('app');

var TvShows = module.exports = Backbone.Collection.extend({

    model: TVShow,

    url: '/api/tvshows',

    /**
     * It returns a new collection applying filters and sort parameters.
     */
    filterAndSortBy: function(opts) {

        // Ensures the filter and sort parameters
        opts.listType       || (opts.listType = 'all');
        opts.filters        || (opts.filters = {});
        opts.filters.genre  || (opts.filters.genre = '');
        opts.criteria       || (opts.criteria = '');

        var items = this.models;

        // Applies the genre filter
        if (opts.filters.genre !== '') {
            items = _.filter(items, function(i) { return _.str.contains(i.get('genre'), opts.filters.genre); });
        }

        // Search criteria
        if (opts.criteria !== '') {
            var regexp = new RegExp(opts.criteria, "i");

            items = _.filter(items, function(i) { 
                var tvShowMatch = regexp.test(i.get('label')) 
                var episodeMatch = 
                _.any(i.get('episodes').models, function(episode){
                    return regexp.test(episode.get('label'));
                });

                return tvShowMatch || episodeMatch;
            });

        }

        return new TvShows(items);
    },

    comparator: function(show1, show2) {
        var show1Label = show1.get('label');
        var show2Label = show2.get('label');

        var result = show1Label < show2Label ? -1 : show1Label > show2Label ? 1 : 0;
        var sortSettings = (app.controller('settings').mediaSettings) ? app.controller('settings').mediaSettings.getSortSettings() : {};
        var ascending = sortSettings['tvshows_order'];
        return result * (ascending ? 1 : (-1));
    }

});