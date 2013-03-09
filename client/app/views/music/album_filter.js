var app = require('app');
var Albums = require('collections/albums');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/music/album_mobile_search_modal');
var FilterModalView = require('views/music/album_mobile_filter_modal');
var musicController = app.controller('music');

module.exports = FilterPanelView.extend({

	events: {
        // Search and clear criteria
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Filter by Genre
        'click #music-genre-list li a' : 'filterByGenre',
        'click #music-year-list li a' : 'filterByYear',

        // Touch events
        'click .touch-music-search': 'openMobileSearchDialog',
        'click .touch-music-filter': 'openMobileFilterDialog',
        'click .touch-music-default': 'clearMobile'
	},

    template: require('templates/music/album_filter'),

    AllYears: 'All Years',

    AllGenres: 'All Genres',
    
    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        this.$('button.clear').hide();
        this.$('button.search').show();

        this.bindTo(this.model, 'change', this.refreshDisplayedAlbums, this);

        this.genres = _.compact(_.union([this.AllGenres], musicController.filters.album.genres));
        this.years = _.compact(_.union([this.AllYears], musicController.filters.album.years));

        this.renderGenres( this.genres );
        this.renderYears( this.years );
    },

    renderGenres: function(genreList) {
        _.each(genreList, function(genre) {
            var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
            this.$('#music-genre-list').append(listItem);
        }, this);
    },

    renderYears: function(yearList) {
        _.each(yearList, function(year) {
            var listItem = $('<li><a href="#" data-year="' + year + '">' + year + '</a></li>');
            this.$('#music-year-list').append(listItem);
        }, this);
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

    filterByGenre: function(event) {
        var $element = $(event.currentTarget);
        var genre = $element.data('genre');

        var $filterBtn = this.$('#genre-filter');
        $filterBtn.find('.current-genre').html(genre);
        $filterBtn.parent().removeClass('open');

        this.filterByGenreAndYear({genre: genre});
        return false;
    },

    filterByYear: function(event) {
        var $element = $(event.currentTarget);
        var year = $element.data('year').toString();

        var $filterBtn = this.$('#year-filter');
        $filterBtn.find('.current-year').html(year);
        $filterBtn.parent().removeClass('open');

        this.filterByGenreAndYear({year: year});
        return false;
    },

    refreshDisplayedAlbums: function() {
        var opts = {};

        if (this.filter.lastN) {
            opts.listType = 'recently-added';
        } else {
            opts = {
                filters: {
                    genre: this.filter['genre'],
                    year: this.filter['year']
                },
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
        modal.on('media-music:search', function(criteria) {
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
        modal.on('media-music:filter', function(filters) {
            this.filterByGenreAndYear(filters);
        }, this);

        app.modal.show(modal);
    },

    // Filter functions
    filterByGenreAndYear: function(filters) {
        filters || (filters = {});

        if (filters.year && (filters.year !== this.AllYears)) {
            this.filter['year'] = filters.year;
        } else if (filters.year === this.AllYears) {
            this.filter['year'] = null;
        }

        if (filters.genre && (filters.genre !== this.AllGenres)) {
            this.filter['genre'] = filters.genre;
        } else if (filters.genre === this.AllGenres) {
            this.filter['genre'] = null;
        }

        this.refreshDisplayedAlbums();
    },

    clearMobile: function() {
        this.filter = {};
        this.performSearch('');
        this.refreshDisplayedAlbums();
    }
});