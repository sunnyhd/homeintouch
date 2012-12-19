var app = require('app');
var FilterPanelView = require('views/filtered_panel');
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
        'click .touch-movies-refresh': 'clearMobile'
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
        this.loadGenres( moviesController.filters.genres );
        this.loadYears( moviesController.filters.years );
    },

    setListBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#movies/list-view"]').addClass('active');
    },
    
    setCoverBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#movies/cover-view"]').addClass('active');
    },

    loadGenres: function(genreList) {

    	var allListItem = $('<li><a href="#" data-genre="' + this.AllGenres + '">' + this.AllGenres + '</a></li>');
    	this.$('#movie-genre-list').append(allListItem);

        if (genreList) {
        	for (var i = 0; i < genreList.length; i++) {
        		var genre = genreList[i];
        		var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
        		this.$('#movie-genre-list').append(listItem);
        	}
        }
    },

    loadYears: function(yearList) {

        var allListItem = $('<li><a href="#" data-year="' + this.AllYears + '">' + this.AllYears + '</a></li>');
        this.$('#movie-year-list').append(allListItem);

        if (yearList) {
            for (var i = 0; i < yearList.length; i++) {
                var year = yearList[i];
                var listItem = $('<li><a href="#" data-year="' + year + '">' + year + '</a></li>');
                this.$('#movie-year-list').append(listItem);
            }
        }
    },

    listViewClicked: function(e) {
        var $btn = $(e.currentTarget);
        app.router.navigate($btn.attr('href'), {trigger: true});
        
        return false;
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

    },

    openMobileFilterDialog: function() {

    },

    clearMobile: function() {
        
    }
});