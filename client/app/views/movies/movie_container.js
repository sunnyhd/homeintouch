var app = require('app');
var Movies = require('collections/movies');
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

        // Clones the movie collection
        this.filteredCollection = new Movies( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new MovieFilterView({ collection: this.filteredCollection });
        this.filterView.on('searchFired', this.performSearch, this);
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
    },

    performSearch: function(filterModel) {
        this.listView.model.set(filterModel.attributes);
    },

    onToggleSearchComponent: function() {
        var $btnShowMenu = this.$el.find('.mobile-search-menu');
        var $search = this.$el.find('.movies-header');

        if ($search.css('display') === 'block') {
            $search.hide( 'slide', {}, 500 );
            $search.removeClass('mobile-showed');
            $btnShowMenu.removeClass('open');
        } else {
            $search.show( 'slide', {}, 500 );
            $search.addClass('mobile-showed');
            $btnShowMenu.addClass('open');
        }        
    }
});