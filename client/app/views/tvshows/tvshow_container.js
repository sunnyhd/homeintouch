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
        
        var listView = new TVShowListView({ collection: this.collection });
        var filterView = new TVShowFilterView({ collection: this.collection });

        this.filter.show(filterView);
        this.list.show(listView);
    }
});