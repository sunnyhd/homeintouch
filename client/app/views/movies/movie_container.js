var app = require('app');
var MovieListView = require('views/movies/movie_list');
var MovieCoverView = require('views/movies/movie_cover_list');
var MovieFilterView = require('views/movies/movie_filter');
var MovieSelectorListView = require('views/movies/movie_selector_list');

module.exports = Backbone.Marionette.Layout.extend({

    events: {
        'click .mobile-search-menu': 'onToggleSearchComponent'
    },

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
    },

    onToggleSearchComponent: function() {
        var $search = this.$el.find('.movies-header');
        $search.toggle( 'slide', {}, 500 );
    }
});