var app = require('app');
var Movies = require('collections/movies');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/movies/movie_mobile_search_modal');
var FilterModalView = require('views/movies/movie_mobile_filter_modal');
var moviesController = app.controller('movies');

module.exports = FilterPanelView.extend({

	events: {
        // List type
		'click .movie-state-filter a[data-filter]' : 'movieListTypeChanged',

        // Genre and year
        'click #movie-genre-list li a' : 'filterByGenre',
        'click #movie-year-list li a' : 'filterByYear',

        // View type (list or conver)
        'click #view-mode-group button': 'listViewClicked',

        // Search and clear criteria
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Touch events
        'click .touch-movies-search': 'openMobileSearchDialog',
        'click .touch-movies-filter': 'openMobileFilterDialog',
        'click .touch-movies-default': 'clearMobile'
	},

    template: require('templates/movies/movie_filter'),
    
    AllGenres: 'All Genres',

    AllYears: 'All Years',

    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        this.$('button.clear').hide();
        this.$('button.search').show();

        this.bindTo(this.model, 'change', this.refreshDisplayedMovies, this);
        
        this.genres = _.compact(_.union([this.AllGenres], moviesController.filters.genres));
        this.years = _.compact(_.union([this.AllYears], moviesController.filters.years));

        this.renderGenres( this.genres );
        this.renderYears( this.years );
    },

    setListBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#movies/list-view"]').addClass('active');
    },
    
    setCoverBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#movies/cover-view"]').addClass('active');
    },

    renderGenres: function(genreList) {
        _.each(genreList, function(genre) {
            var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
            this.$('#movie-genre-list').append(listItem);
        }, this);
    },

    renderYears: function(yearList) {
        _.each(yearList, function(year) {
            var listItem = $('<li><a href="#" data-year="' + year + '">' + year + '</a></li>');
            this.$('#movie-year-list').append(listItem);
        }, this);
    },

    listViewClicked: function(e) {
        var $btn = $(e.currentTarget);
        app.router.navigate($btn.attr('href'), {trigger: true});        
        return false;
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

        this.refreshDisplayedMovies();
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

    // Movie list type functions
    movieListTypeChanged: function(event) {
        var $element = $(event.currentTarget);
        this.filterByGenreAndYear();

        this.setCurrentMovieListType($element.html());
        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');
        return false;
    },
    setCurrentMovieListType: function(filterName) {
        this.$('#filter-name').text(filterName);
    },


    refreshDisplayedMovies: function() {
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
        var originalCollection = new Movies(this.collections.originalModels);
        this.resetCollection( originalCollection.filterAndSortBy(opts) );
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-movies:search', function(criteria) {
            this.performSearch(criteria);
            this.refreshDisplayedMovies();
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
        this.refreshDisplayedMovies();
    }
});