module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/database_settings'),

    events: {
        'click [data-action="save"]': 'save',
        'click [data-action="cancel"]': 'cancel',
        'click .close': 'cancel'
    },

    initialize: function() {
        this.dbConfig = this.options.data;
    },

    serializeData: function() {
        return this.dbConfig;
    },

    // Event Handlers

    save: function() {
        var result = {};

        result.ip = $('#ip').val();
        result.port = $('#port').val();

        var that = this;
        $.post('/api/db/config', result)
        .success(function() {
            that.close();
        })
    },

    cancel: function () {
        this.close();
    }

});