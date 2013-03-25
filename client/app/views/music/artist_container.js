var app = require('app');
var Artists = require('collections/artists');
var ArtistListView = require('views/music/artist_list');
var ArtistCoverView = require('views/music/artist_cover_list');
var ArtistFilterView = require('views/music/artist_filter');
var ArtistSelectorListView = require('views/music/artist_selector_list');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/music/music_container'),

    regions: {
        filter: "#music-filter",
        list: "#music-list"
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var listSelectorView = new ArtistSelectorListView();
        app.touchBottomContent.show(listSelectorView);
        listSelectorView.select(this.options.mode);

        // Clones the movie collection
        this.filteredCollection = new Artists( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new ArtistFilterView({ collection: this.filteredCollection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        if (this.options.mode === 'cover') {
            this.filterView.setCoverBtnActive();
            this.listView = new ArtistCoverView({ collection: this.filteredCollection });
        } else {
            this.filterView.setListBtnActive();
            this.listView = new ArtistListView({ collection: this.filteredCollection });            
        }

        //app.vent.off('refresh-movie-views');
        //app.vent.on('refresh-movie-views', this.render, this.listView);

        this.list.show(this.listView);
    }
});