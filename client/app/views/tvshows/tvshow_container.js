var TvShows = require('collections/tvshows');
var TVShowListView = require('views/tvshows/tvshow_list');
var TVShowFilterView = require('views/tvshows/tvshow_filter');

module.exports = Backbone.Marionette.Layout.extend({

    events: {
        'click .mobile-search-menu': 'onToggleSearchComponent'
    },

    template: require('templates/tvshows/tvshow_container'),

    regions: {
        filter: "#tvshow-filter",
        list: "#tvshow-list"
    },

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        // Clones the movie collection
        this.filteredCollection = new TvShows( _.map(this.collection.models, function(model) { return model.clone(); }) );
        
        this.listView = new TVShowListView({ collection: this.filteredCollection });
        this.filterView = new TVShowFilterView({ collection: this.filteredCollection });

        this.filter.show(this.filterView);
        this.list.show(this.listView);
    },

    performSearch: function(filterModel) {
        this.listView.model.set(filterModel.attributes);
    },

    onToggleSearchComponent: function() {
        var $btnShowMenu = this.$el.find('.mobile-search-menu');
        var $search = this.$el.find('.tvshow-header');

        if ($search.css('display') === 'block') {
            $search.hide( 'slide', {}, 500 );
            $search.removeClass('mobile-showed');
            $btnShowMenu.removeClass('open');
        } else {
            $search.show( 'slide', {}, 500 );
            $search.addClass('mobile-showed');
            $btnShowMenu.addClass('open');
        }        
    }
});