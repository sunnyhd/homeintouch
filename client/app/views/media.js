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
    
    template: '#movie-item-template'
    
});

exports.MovieLayout = Backbone.Marionette.CompositeView.extend({
    
    template: '#movie-layout-template',
    
    itemView: exports.MovieItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    }
    
});