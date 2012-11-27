var settingsController = require('controllers/settings');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/media_configuration_options'),

    events: {
        'click a[data-action]': 'clickHandler'
    },

    clickHandler: function(event) {
        var $element = $(event.currentTarget);
        var action = $element.data('action');

        if (action === "edit-database") {
            settingsController.showDatabaseSettings();
        }
    }
});