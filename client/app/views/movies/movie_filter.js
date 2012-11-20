var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

	events: {
		'click a[data-filter]' : 'filterMovies',
		'click #movie-genre-list li a' : 'filterByGenre',
        'click #view-mode-group button': 'listViewClicked'
	},

    template: require('templates/movies/movie_filter'),
    
    AllGenres: 'All',

    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
    	var that = this;
    	$.get('/api/genres/movies')
    	.done(function(data) {
    		that.loadGenres(data);
    	});
    },

    loadGenres: function(genreList) {

    	var allListItem = $('<li><a href="#" data-genre="' + this.AllGenres + '">' + this.AllGenres + '</a></li>');
    	this.$('#movie-genre-list').append(allListItem);

    	for (var i = 0; i < genreList.length; i++) {
    		var genre = genreList[i];
    		var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
    		this.$('#movie-genre-list').append(listItem);
    	};
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

        var $filterBtn = this.$('[data-filter="genre"]');

        $filterBtn.html('Genre: ' + genre);
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
    }
    
});