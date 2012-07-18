module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/iframe_modal'),

    events: {
        'click .close': 'close',
    },

    initialize: function(options) {
        this.label = options.label;
        this.src = options.src;
    },

    serializeData: function() {
        return { label: this.label, src: this.src };
    }

});