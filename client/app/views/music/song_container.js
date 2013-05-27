var app = require('app');
var PaginatedSongs = require('collections/songs_paginated');
var SongListView = require('views/music/song_list');
var SongFilterView = require('views/music/song_filter');

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
        this.filteredCollection = this.collection; //new PaginatedSongs( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new SongFilterView({ collection: this.filteredCollection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        this.listView = new SongListView({ collection: this.filteredCollection });

        //app.vent.off('refresh-movie-views');
        //app.vent.on('refresh-movie-views', this.render, this.listView);

        this.list.show(this.listView);
    }
});