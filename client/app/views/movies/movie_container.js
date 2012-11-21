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

        this.filterView = new MovieFilterView({ collection: this.collection });
        this.filterView.on('searchFired', this.performSearch, this);

        this.filter.show(this.filterView);
        
        if (this.options.mode === 'cover') {
            this.filterView.setCoverBtnActive();
            this.listView = new MovieCoverView({ collection: this.collection });
        } else {
            this.filterView.setListBtnActive();
            this.listView = new MovieListView({ collection: this.collection });            
        }

        this.list.show(this.listView);
    },

    performSearch: function(filterModel) {
        this.listView.model.set(filterModel.attributes);
    }
});