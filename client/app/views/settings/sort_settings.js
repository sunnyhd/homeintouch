var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/sort_settings'),

    events: {
        'click [data-action="save"]': 'save',
        'click [data-action="cancel"]': 'cancel',
        'click .close': 'cancel'
    },

    // Event Handlers

    save: function() {

        var sortConfiguration = {};
        var $inputs = this.$('input');
        _.each($inputs, function(input, idx) {
            var $input = $(input);
            var id = $input.attr('id');
            sortConfiguration[id] = $input.is(':checked');
        }, this);

        var that = this;

        var saveOptions = {success: function(model) {
            app.controller('settings').mediaSettings = model;
            that.close();
            app.vent.trigger('sort-media-collections');
        }};

        if (this.model.isNew()) {
            this.model.save(sortConfiguration, saveOptions);
        } else {
            this.model.set('sort', sortConfiguration);
            this.model.save(this.model.attributes, saveOptions);
        }
    },

    cancel: function () {
        this.close();
    }

});