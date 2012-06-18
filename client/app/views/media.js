var moviesController = require('controllers/movies');

// Movies
// ---------------

exports.MovieItemView = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'movie',
    
    template: '#movie-item-template',

    events: {
        'click a.add-to-playlist': 'addToPlaylist',
        'click a.play': 'play'
    },

    addToPlaylist: function(e) {
        e.preventDefault();
        moviesController.addToPlaylist(this.model);
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    }
    
});

exports.MovieLayout = Backbone.Marionette.CompositeView.extend({
    
    template: '#movie-layout-template',
    
    itemView: exports.MovieItemView,

    events: {
        'click .prev': 'prevPage',
        'click .next': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    },

    prevPage: function(e) {
        e.preventDefault();
        this.collection.prevPage();
    },

    nextPage: function(e) {
        e.preventDefault();
        this.collection.nextPage();
    }
    
});

// Modals
// ---------------

exports.AddToPlaylistForm = Backbone.Marionette.ItemView.extend({

    template: "#add-to-playlist-template",

    events: {
        "click .add": "addClicked",
        "click .cancel": "cancelClicked"
    },

    initialize: function() {
        this.bindTo(this.collection, 'reset', this.render, this);
    },

    serializeData: function() {
        return { playlists: this.collection.toJSON() };
    },

    addClicked: function(e){
        e.preventDefault();
        var playlistid = this.$("#playlist").val();
        this.trigger("save", playlistid);
        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }

});