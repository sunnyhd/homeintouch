var app = require('app');
var PaginatedSongs = require('collections/songs_paginated');
var SongListView = require('views/music/song_list');
var SongListPagerView = require('views/music/song_list_pager');
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

        this.filterView = new SongFilterView({ collection: this.collection });
        this.filterView.on('filter-songs', this.performSearch);
        this.filter.show(this.filterView);

        this.listView = new SongListView({ collection: this.collection });

        this.list.show(this.listView);

        var songListPagerView = new SongListPagerView();
        app.touchBottomContent.show(songListPagerView);
        songListPagerView.on('show-more', this.listView.nextPage, this.listView);
    },

    performSearch: function(opts) {
        this.collection.filter(opts);
    }
});