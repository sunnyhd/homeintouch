var app = require('app');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/movies/movie_mobile_search_modal');
var FilterModalView = require('views/movies/movie_mobile_filter_modal');
var moviesController = app.controller('movies');

module.exports = FilterPanelView.extend({

	events: {
		'click .movie-state-filter a[data-filter]' : 'filterMovies',
        'click #view-mode-group button': 'listViewClicked',
        'click #movie-genre-list li a' : 'filterByGenre',
        'click #movie-year-list li a' : 'filterByYear',

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

    filterByGenreAndYear: function(filters) {

        if (filters.year === this.AllYears) {
            delete this.filter.year;
        } else {
            this.filter['year'] = filters.year;
        }

        if (filters.genre === this.AllGenres) {
            delete this.filter.genre;
        } else {
            this.filter['genre'] = filters.genre;
        }

        console.log('filterByGenreAndYear');
        console.log(this.filter);
        this.listMovies();
    },

    filterByGenre: function(event) {
        var $element = $(event.currentTarget);
        var genre = $element.data('genre');
    	if (genre === this.AllGenres) {
    		delete this.filter.genre;
    	} else {
    		this.filter['genre'] = genre;
    	}

        var $filterBtn = this.$('#genre-filter');
        $filterBtn.find('.current-genre').html(genre);
        $filterBtn.parent().removeClass('open');

    	this.listMovies();
        return false;
    },

    filterByYear: function(event) {
        var $element = $(event.currentTarget);
        var year = $element.data('year');

        if (year === this.AllYears) {
            delete this.filter.year;
        } else {
            this.filter['year'] = year;
        }

        var $filterBtn = this.$('#year-filter');
        $filterBtn.find('.current-year').html(year);
        $filterBtn.parent().removeClass('open');

        this.listMovies();        
        return false;
    },

    filterMovies: function(event) {
        var $element = $(event.currentTarget);
        var filter = $element.data('filter');

        if (filter === "all") {
            this.filter = this.getListAllFilter();
        } else if (filter === "recently-added") {
            this.filter = this.getRecentlyAddedFilter();
        } else if (filter === "recently-viewed") {

        } else if (filter === "unwatched") {
            this.filter = this.getUnwatchedFilter();
        }

        this.listMovies();
        this.setCurrentFilterName($element.html());

        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');

        return false;
    },

    getRecentlyAddedFilter: function() {
        return {lastN: 25};
    },

    getListAllFilter: function() {
    	return {};
    },

    getUnwatchedFilter: function() {
    	return {playcount : 0};
    },

    listMovies: function() {
        if (this.filter.lastN) {
            this.collection.setLastN(25);
            this.collection.fetch();
        } else {
            this.collection.clearLastN();
            this.collection.fetch({data: this.filter});
        }
    },

    setCurrentFilterName: function(filterName) {
        this.$('#filter-name').text(filterName);
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-movies:search', function(criteria) {
            this.search(criteria);
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
            console.log(filters);
            this.filterByGenreAndYear(filters);
        }, this);

        app.modal.show(modal);
    },

    clearMobile: function() {
        this.filter = {};
        this.search('');
        this.collection.clearLastN();
    }
});