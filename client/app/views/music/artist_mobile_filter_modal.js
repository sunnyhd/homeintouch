
module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/music/artist_mobile_dialog_filter'),

    events: {
        'click .close': 'close',
        'click button.filter': 'filter'
    },

    initialize: function(options) {
        this.options = options;
    },

    onRender: function() {
        $('.genres-filter', this.$el).val( this.options.currentGenre );
    },

    serializeData: function() {
        return this.options;
    },

    filter: function() {
        var genre = $('.genres-filter', this.$el).val();

        this.trigger('media-music:filter', {genre: genre} );
        this.close();
        return false;
    }
});