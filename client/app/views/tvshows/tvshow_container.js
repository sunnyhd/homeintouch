var TVShowListView = require('views/tvshows/tvshow_list');
var TVShowFilterView = require('views/tvshows/tvshow_filter');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/tvshows/tvshow_container'),

    regions: {
        filter: "#tvshow-filter",
        list: "#tvshow-list"
    },

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
        
        this.listView = new TVShowListView({ collection: this.collection });
        this.filterView = new TVShowFilterView({ collection: this.collection });

        this.filterView.on('searchFired', this.performSearch, this);

        this.filter.show(this.filterView);
        this.list.show(this.listView);
    },

    performSearch: function(filterModel) {
        this.listView.model.set(filterModel.attributes);
    }
});