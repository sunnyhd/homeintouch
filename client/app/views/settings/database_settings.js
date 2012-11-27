module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/database_settings'),

    events: {
        'click .btn.save': 'save',
        'click .btn.cancel': 'cancel',
        'click .close': 'cancel'
    },

    // Event Handlers

    save: function() {

    },

    cancel: function () {
        this.close();
    }

});