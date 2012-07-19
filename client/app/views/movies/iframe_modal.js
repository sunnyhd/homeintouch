module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/iframe_modal'),

    events: {
        'click .close': 'close',
    },

    initialize: function(options) {
        this.options = options;
    },

    serializeData: function() {
        return this.options;
    }

});