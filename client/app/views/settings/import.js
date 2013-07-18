module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/settings/import'),

    events: {
        'click [data-import]': 'start',
        'click .close': 'cancel'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    // Event Handlers

    start: function(event) {
        var $target = $(event.currentTarget);
        this.model.set('mediaType', $target.data('import'));
        this.model.save();
        this.model.unset('mediaType');
    },

    cancel: function () {
        this.close();
    }

});