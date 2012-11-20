var MovieListView = require('views/movies/movie_list');
var MovieCoverView = require('views/movies/movie_cover_list');
var MovieFilterView = require('views/movies/movie_filter');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/movies/movie_container'),

    regions: {
        filter: "#movie-filter",
        list: "#movie-list"
    },

    // Avoid rendering when the movies collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var filterView = new MovieFilterView({ collection: this.collection });
        
        var listView;

        if (this.options.mode === 'cover') {
            listView = new MovieCoverView({ collection: this.collection });
        } else {
            listView = new MovieListView({ collection: this.collection });            
        }

        this.filter.show(filterView);
        this.list.show(listView);
    }
});