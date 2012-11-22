var FilterPanelView = require('views/filtered_panel');

module.exports = FilterPanelView.extend({

	events: {
        'click a[data-filter]' : 'filterTvShows',
        'click #tvshow-genre-list li a' : 'filterByGenre',
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear'
	},

    template: require('templates/tvshows/tvshow_filter'),
    
    AllGenres: 'All',

    filter: {},

    filterFields: ['playcount'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        
        this.$('button.clear').hide();
        this.$('button.search').show();

    	var that = this;
    	$.get('/api/genres/tvshows')
    	.done(function(data) {
    		that.loadGenres(data);
    	});
    },

    loadGenres: function(genreList) {

    	var allListItem = $('<li><a href="#" data-genre="' + this.AllGenres + '">' + this.AllGenres + '</a></li>');
    	this.$('#tvshow-genre-list').append(allListItem);

    	for (var i = 0; i < genreList.length; i++) {
    		var genre = genreList[i];
    		var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
    		this.$('#tvshow-genre-list').append(listItem);
    	};
    },

    filterByGenre: function(event) {
    	var $element = $(event.currentTarget);
    	var genre = $element.data('genre');
    	if (genre === this.AllGenres) {
    		delete this.filter.genre;
    	} else {
    		this.filter['genre'] = genre;
    	}

        this.$('[data-filter="genre"]').html('Genre: ' + genre);

    	this.listTvShows();
    },

    filterTvShows: function(event) {

        var $element = $(event.currentTarget);
        var filter = $element.data('filter');

        if (filter === "all") {
            this.filter = this.getListAllFilter();
        } else if (filter === "unwatched") {
            this.filter = this.getUnwatchedFilter();
        }

        this.listTvShows();
        this.setCurrentFilterName($element.html());

        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');

        return false;

    },

    getListAllFilter: function() {
        return {};
    },

    getUnwatchedFilter: function() {
        return {playcount : 0};
    },

    listTvShows: function() {
    	this.collection.fetch({data: this.filter});
    },

    setCurrentFilterName: function(filterName) {
        this.$('#filter-name').text(filterName);
    }
    
});