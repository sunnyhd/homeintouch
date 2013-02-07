var app = require('app');
var Albums = require('collections/albums');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/movies/movie_mobile_search_modal');
var FilterModalView = require('views/movies/movie_mobile_filter_modal');
var musicController = app.controller('music');

module.exports = FilterPanelView.extend({

	events: {
        // Search and clear criteria
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Touch events
        'click .touch-movies-search': 'openMobileSearchDialog',
        'click .touch-movies-filter': 'openMobileFilterDialog',
        'click .touch-movies-default': 'clearMobile'
	},

    template: require('templates/music/album_filter'),
    
    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        this.$('button.clear').hide();
        this.$('button.search').show();

        this.bindTo(this.model, 'change', this.refreshDisplayedAlbums, this);
    },

    // Artist list type functions
    artistListTypeChanged: function(event) {
        var $element = $(event.currentTarget);

        this.setCurrentArtistListType($element.html());
        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');
        return false;
    },

    setCurrentArtistListType: function(filterName) {
        this.$('#filter-name').text(filterName);
    },

    refreshDisplayedAlbums: function() {
        var opts = {};

        if (this.filter.lastN) {
            opts.listType = 'recently-added';
        } else {
            opts = {
                criteria: this.model.get('term')
            };
        }
        console.log(opts);
        var originalCollection = new Albums(this.collections.originalModels);
        this.resetCollection( originalCollection.filterAndSortBy(opts) );
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-movies:search', function(criteria) {
            this.performSearch(criteria);
            this.refreshDisplayedAlbums();
        }, this);

        app.modal.show(modal);
    },

    openMobileFilterDialog: function() {
        var modal = new FilterModalView({
            genres: this.genres,
            years: this.years,
            currentGenre: this.filter['genre'],
            currentYear: this.filter['year']
        });
        modal.on('media-movies:filter', function(filters) {
            this.filterByGenreAndYear(filters);
        }, this);

        app.modal.show(modal);
    },

    clearMobile: function() {
        this.filter = {};
        this.performSearch('');
        this.refreshDisplayedAlbums();
    }
});