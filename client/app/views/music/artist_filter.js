var app = require('app');
var Artists = require('collections/artists');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/music/artist_mobile_search_modal');
var FilterModalView = require('views/music/artist_mobile_filter_modal');
var musicController = app.controller('music');

module.exports = FilterPanelView.extend({

	events: {
        // List type
		'click .movie-state-filter a[data-filter]' : 'artistListTypeChanged',

        // View type (list or conver)
        'click #view-mode-group button': 'listViewClicked',

        // Filter by Genre
        'click #music-genre-list li a' : 'filterByGenre',

        // Search and clear criteria
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Touch events
        'click .touch-music-search': 'openMobileSearchDialog',
        'click .touch-music-filter': 'openMobileFilterDialog',
        'click .touch-music-default': 'clearMobile'
	},

    template: require('templates/music/artist_filter'),

    AllGenres: 'All Genres',
    
    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        this.$('button.clear').hide();
        this.$('button.search').show();

        this.bindTo(this.model, 'change', this.refreshDisplayedArtists, this);

        this.genres = _.compact(_.union([this.AllGenres], musicController.filters.artist.genres));

        this.renderGenres( this.genres );
    },

    setListBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#music/artists/list-view"]').addClass('active');
    },
    
    setCoverBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#music/artists/cover-view"]').addClass('active');
    },

    renderGenres: function(genreList) {
        _.each(genreList, function(genre) {
            var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
            this.$('#music-genre-list').append(listItem);
        }, this);
    },

    listViewClicked: function(e) {
        var $btn = $(e.currentTarget);
        app.router.navigate($btn.attr('href'), {trigger: true});        
        return false;
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

    // Filter functions
    filterByGenreAndYear: function(filters) {
        filters || (filters = {});       

        if (filters.genre && (filters.genre !== this.AllGenres)) {
            this.filter['genre'] = filters.genre;
        } else if (filters.genre === this.AllGenres) {
            this.filter['genre'] = null;
        }

        this.refreshDisplayedArtists();
    },

    refreshDisplayedArtists: function() {
        var opts = {};

        if (this.filter.lastN) {
            opts.listType = 'recently-added';
        } else {
            opts = {
                filters: {
                    genre: this.filter['genre']
                },
                criteria: this.model.get('term')
            };
        }
        console.log(opts);
        var originalCollection = new Artists(this.collections.originalModels);
        this.resetCollection( originalCollection.filterAndSortBy(opts) );
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-music:search', function(criteria) {
            this.performSearch(criteria);
            this.refreshDisplayedArtists();
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

    clearMobile: function() {
        this.filter = {};
        this.performSearch('');
        this.refreshDisplayedArtists();
    }
});