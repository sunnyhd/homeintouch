var app = require('app');
var Albums = require('collections/albums');
var AlbumCoverView = require('views/music/album_list');
var AlbumFilterView = require('views/music/album_filter');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/music/music_container'),

    regions: {
        filter: "#music-filter",
        list: "#music-list"
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        // Clones the movie collection
        this.filteredCollection = new Albums( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new AlbumFilterView({ collection: this.filteredCollection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        this.listView = new AlbumCoverView({ collection: this.filteredCollection });

        //app.vent.off('refresh-movie-views');
        //app.vent.on('refresh-movie-views', this.render, this.listView);

        this.list.show(this.listView);
    }
});