var app = require('app');
var Files = require('collections/files');
var FilterPanelView = require('views/filtered_panel');
var SearchModalView = require('views/pictures/picture_mobile_search_modal');
var ActionsModalView = require('views/pictures/picture_mobile_actions_modal');
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
        'click .touch-pictures-actions': 'openMobileActionsDialog',
        'click .touch-pictures-default': 'clearMobile'
	},

    template: require('templates/pictures/picture_filter'),
    
    filter: {},

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        this.showSearchIcon();

        this.bindTo(this.model, 'change', this.refreshDisplayedPictures, this);
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

    showSearchIcon: function() {

        var $clearButton = this.$('button.clear');
        var $searchButton = this.$('button.search');

        var $buttonGroup = $searchButton.parent();

        $buttonGroup.empty();

        $clearButton.appendTo($buttonGroup);
        $searchButton.appendTo($buttonGroup);

        FilterPanelView.prototype.showSearchIcon.call(this);
    },

    hideSearchIcon: function() {
        var $clearButton = this.$('button.clear');
        var $searchButton = this.$('button.search');

        var $buttonGroup = $searchButton.parent();

        $buttonGroup.empty();

        $searchButton.appendTo($buttonGroup);
        $clearButton.appendTo($buttonGroup);

        FilterPanelView.prototype.hideSearchIcon.call(this);
    },

    // Filter functions
    filterByGenreAndYear: function(filters) {
        this.refreshDisplayedPictures();
    },

    // Picture list type functions
    pictureListTypeChanged: function(event) {
        var $element = $(event.currentTarget);
        this.filterByGenreAndYear();

        this.$('button[data-toggle="dropdown"]').parent().removeClass('open');
        return false;
    },

    refreshDisplayedPictures: function() {
        var opts = {
            criteria: this.model.get('term')
        };

        var options = {
            type: this.collection.type,
            directory: this.collection.directory
        };

        console.log(opts);
        var originalCollection = new Files(this.collections.originalModels, options);
        this.resetCollection( originalCollection.filterAndSortBy(opts) );
    },

    refreshCollection: function() {
        this.collections.originalModels = this.collection.models;
        this.collections.lastModels = this.collection.models;
    },

    // Touch event handlers
    openMobileSearchDialog: function() {
        var modal = new SearchModalView( { term: this.model.get('term') } );
        modal.on('media-pictures:search', function(criteria) {
            this.performSearch(criteria);
            this.refreshDisplayedPictures();
        }, this);

        app.modal.show(modal);
    },

    openMobileActionsDialog: function() {
        var modal = new ActionsModalView( { term: this.model.get('term') } );
        modal.on('media-pictures:slideshow:play', function() {
             this.collection.play();
        }, this);
         modal.on('media-pictures:slideshow:watch', function() {
            app.router.navigate('pictures/cover-view/slideshow/' + this.collection.directory, { trigger: true });
        }, this);

        app.modal.show(modal);
    },

    clearMobile: function() {
        this.filter = {};
        this.performSearch('');
        this.refreshDisplayedPictures();
    }
});