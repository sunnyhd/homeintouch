module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_mobile_dialog_search'),

    events: {
        'click .close': 'close',
        'click button.search': 'search'
    },

    initialize: function(options) {
        this.options = options;
    },

    serializeData: function() {
        return this.options;
    },

    search: function() {
        var criteria = $('input.search-query', this.$el).val();
        this.trigger('media-pictures:search', criteria);
        this.close();
        return false;
    }
});