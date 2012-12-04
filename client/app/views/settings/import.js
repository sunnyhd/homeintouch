module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/import'),

    events: {
        'click .start': 'start'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    // Event Handlers

    start: function() {
        this.model.save();
    }

});