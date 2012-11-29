module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/sort_settings'),

    events: {
        'click .btn.save': 'save',
        'click .btn.cancel': 'cancel',
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

        this.model.set('sort', sortConfiguration);
        this.model.save({success: function(model) {
            that.close();
        }});
    },

    cancel: function () {
        this.close();
    }

});