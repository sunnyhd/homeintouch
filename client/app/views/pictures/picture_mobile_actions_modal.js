module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_mobile_dialog_actions'),

    events: {
        'click .close': 'close',
        'click [data-action="play-slideshow"]': 'play',
        'click [data-action="watch-slideshow"]': 'watch'
    },

    initialize: function(options) {
        this.options = options;
    },

    serializeData: function() {
        return this.options;
    },

    play: function(e) {
        e.preventDefault();
        this.trigger('media-pictures:slideshow:play');
        this.close();
        return false;
    },

    watch: function(e) {
        e.preventDefault();
        this.trigger('media-pictures:slideshow:watch');
        this.close();
        return false;
    }
});