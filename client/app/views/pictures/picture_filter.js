var app = require('app');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/pictures/picture_mobile_search_modal');
var picturesController = app.controller('pictures');

module.exports = FilterPanelView.extend({

	events: {
        // List type
		'click .picture-state-filter a[data-filter]' : 'pictureListTypeChanged',

        // View type (list or conver)
        'click #view-mode-group button': 'listViewClicked',

        // Search and clear criteria
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear',

        // Touch events
        'click .touch-pictures-search': 'openMobileSearchDialog',
        'click .touch-pictures-default': 'clearMobile'
	},

    template: require('templates/pictures/picture_filter'),
    
    filter: {},

    filterFields: ['playcount', 'lastN'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        this.$('button.clear').hide();
        this.$('button.search').show();
    },

    setListBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#pictures/list-view"]').addClass('active');
    },
    
    setCoverBtnActive: function() {
        this.$('#view-mode-group button').removeClass('active');
        this.$('#view-mode-group button[href="#pictures/cover-view"]').addClass('active');
    },

    listViewClicked: function(e) {
        var $btn = $(e.currentTarget);
        var directory = this.collection.directory ? this.collection.directory : '';
        app.router.navigate($btn.attr('href') + directory, {trigger: true});
        return false;
    },

    // Filter functions
    filterByGenreAndYear: function(filters) {
        this.refreshDisplayedMovies();
    },

    // Picture list type functions
    pictureListTypeChanged: function(event) {
        var $element = $(event.currentTarget);
        this.filterByGenreAndYear();

        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');
        return false;
    },

    refreshDisplayedMovies: function() {
        var opts = {
            criteria: this.model.get('term')
        };

        console.log(opts);
        var originalCollection = new Movies(this.collections.originalModels);
        this.resetCollection( originalCollection.filterAndSortBy(opts) );
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-pictures:search', function(criteria) {
            this.performSearch(criteria);
            this.refreshDisplayedMovies();
        }, this);

        app.modal.show(modal);
    },

    clearMobile: function() {
        this.filter = {};
        this.performSearch('');
        this.refreshDisplayedMovies();
    }
});