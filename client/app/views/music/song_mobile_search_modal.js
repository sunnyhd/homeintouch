
module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/music/song_mobile_dialog_search'),

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
        this.trigger('media-music:search', criteria);
        this.close();
        return false;
    }
});