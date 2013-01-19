var app = require('app');
var Albums = require('collections/movies');
var MovieListView = require('views/movies/movie_list');
var MovieCoverView = require('views/movies/movie_cover_list');
//var MusicFilterView = require('views/music/music_filter');
//var MusicSelectorListView = require('views/music/music_selector_list');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/music/music_container'),

    regions: {
        filter: "#music-filter",
        list: "#music-list"
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var listSelectorView = new MusicSelectorListView();
        app.touchBottomContent.show(listSelectorView);
        listSelectorView.select(this.options.mode);
        var collectionClass = this.options.collectionClass;

        // Clones the movie collection
        this.filteredCollection = new collectionClass( _.map(this.collection.models, function(model) { return model.clone(); }) );

        this.filterView = new MusicFilterView({ collection: this.filteredCollection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        if (this.options.mode === 'cover') {
            this.filterView.setCoverBtnActive();
            this.listView = new MusicCoverView({ collection: this.filteredCollection });
        } else {
            this.filterView.setListBtnActive();
            this.listView = new MovieListView({ collection: this.filteredCollection });            
        }

        app.vent.off('refresh-movie-views');
        app.vent.on('refresh-movie-views', this.render, this.listView);

        this.list.show(this.listView);
    }
});