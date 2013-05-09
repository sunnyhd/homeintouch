module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'playlist-item',

    template: require('templates/playlists/playlist_item'),

    events: {
        'click [data-action=play]': 'play',
        'click [data-action=remove]': 'removeFromPlaylist'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    onRender: function() {
        if (this.model.get('active')) {
           this.$el.addClass('active');
           //TODO REMOVE
           this.$el.css({'font-weight': 'bold', 'color': '#FFF'});
        } else {
            this.$el.css({'font-weight': 'normal', 'color': ''});
        }
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    },

    removeFromPlaylist: function(e) {
        e.preventDefault();
        this.model.removeFromPlaylist();
    }

});