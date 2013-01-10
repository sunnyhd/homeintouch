var app = require('app');
var Movies = require('collections/movies');
var MovieListView = require('views/movies/movie_list');
var MovieCoverView = require('views/movies/movie_cover_list');
var MovieFilterView = require('views/movies/movie_filter');
var MovieSelectorListView = require('views/movies/movie_selector_list');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/movies/movie_container'),

    regions: {
        filter: "#movie-filter",
        list: "#movie-list"
    },

    // Avoid rendering when the movies collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var listSelectorView = new MovieSelectorListView();
        app.touchBottomContent.show(listSelectorView);
        listSelectorView.select(this.options.mode);

        // Clones the movie collection
        this.filteredCollection = new Movies( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new MovieFilterView({ collection: this.filteredCollection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        if (this.options.mode === 'cover') {
            this.filterView.setCoverBtnActive();
            this.listView = new MovieCoverView({ collection: this.filteredCollection });
        } else {
            this.filterView.setListBtnActive();
            this.listView = new MovieListView({ collection: this.filteredCollection });            
        }

        app.vent.off('refresh-movie-views');
        app.vent.on('refresh-movie-views', this.render, this.listView);

        this.list.show(this.listView);
    }
});