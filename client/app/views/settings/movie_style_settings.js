var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/movie_style_settings'),

    events: {
        'click [data-action="save"]': 'save',
        'click [data-action="cancel"]': 'cancel',
        'click .close': 'cancel'
    },

    // Event Handlers

    save: function() {

        var movieStyleConfiguration = {};
        var $inputs = this.$('input');
        _.each($inputs, function(input, idx) {
            var $input = $(input);
            var id = $input.attr('id');
            movieStyleConfiguration[id] = $input.is(':checked');
        }, this);

        var that = this;

        var saveOptions = {success: function(model) {
            app.controller('settings').mediaSettings = model;
            that.close();
            app.vent.trigger('refresh-movie-views');
        }};

        if (this.model.isNew()) {
            this.model.save(movieStyleConfiguration, saveOptions);
        } else {
            this.model.set('movie_style', movieStyleConfiguration);
            this.model.save(this.model.attributes, saveOptions);
        }
    },

    cancel: function () {
        this.close();
    }

});