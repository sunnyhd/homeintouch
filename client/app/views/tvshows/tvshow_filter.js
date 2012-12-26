var app = require('app');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/tvshows/tvshow_mobile_search_modal');
var FilterModalView = require('views/tvshows/tvshow_mobile_filter_modal');
var tvShowsController = app.controller('tvshows');

module.exports = FilterPanelView.extend({

	events: {
        'click a[data-filter]' : 'filterTvShows',
        'click #tvshow-genre-list li a' : 'filterByGenre',
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Touch events
        'click .touch-tvshow-search': 'openMobileSearchDialog',
        'click .touch-tvshow-filter': 'openMobileFilterDialog',
        'click .touch-tvshow-default': 'clearMobile'
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

        this.genres = _.compact(_.union([this.AllGenres], tvShowsController.filters.genres));

        this.renderGenres( this.genres );
    },

    renderGenres: function(genreList) {
        _.each(genreList, function(genre) {
            var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
            this.$('#tvshow-genre-list').append(listItem);
        }, this);
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
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-tvshow:search', function(criteria) {
            this.search(criteria);
        }, this);

        app.modal.show(modal);
    },

    openMobileFilterDialog: function() {
        var modal = new FilterModalView({
            genres: this.genres,
            currentGenre: this.filter['genre']
        });
        modal.on('media-tvshow:filter', function(filters) {
            console.log(filters);
            this.filterByGenre(filters);
        }, this);

        app.modal.show(modal);
    },

    clearMobile: function() {
        this.filter = {};
        this.search('');
    }
    
});