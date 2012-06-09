var moviesController = require('controllers/movies');
var playlistsController = require('controllers/playlists');

exports.PlaylistsItemView = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    template: '#playlists-item-template',

    events: {
        'click a': 'playlistClicked'
    },

    onRender: function() {
        this.$el.attr('data-type', this.model.get('type'));
    },

    playlistClicked: function(e) {
        e.preventDefault();
        playlistsController.selectPlaylist(this.model);
    }

});

exports.PlaylistsLayout = Backbone.Marionette.CompositeView.extend({

    template: '#playlists-layout-template',

    itemView: exports.PlaylistsItemView,

    initialize: function(){
        this.bindTo(this.collection, 'select', this.render, this);
    },

    appendHtml: function(cv, iv) {
        this.$('.playlists').append(iv.el);
    },

    onRender: function() {
        var selected = this.collection.getSelected();

        if (selected) {
            var type = selected.get('type');

            this.$('.playlists li').removeClass('active');
            this.$('.playlists li[data-type=' + type + ']').addClass('active');
        }
    }

});

exports.PlaylistItemView = Backbone.Marionette.ItemView.extend({

    template: '#playlist-item-template'

});

exports.PlaylistLayout = Backbone.Marionette.CompositeView.extend({

    template: '#playlist-layout-template',

    itemView: exports.PlaylistItemView,

    appendHtml: function(cv, iv) {
        this.$('.items').append(iv.el);
    }

});

exports.MovieItemView = Backbone.Marionette.ItemView.extend({
    
    template: '#movie-item-template',

    events: {
        'click a.add-to-playlist': 'addToPlaylist'
    },

    addToPlaylist: function(e) {
        e.preventDefault();
        moviesController.addToPlaylist(this.model);
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