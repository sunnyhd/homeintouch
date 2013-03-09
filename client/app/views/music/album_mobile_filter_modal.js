
module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/music/album_mobile_dialog_filter'),

    events: {
        'click .close': 'close',
        'click button.filter': 'filter'
    },

    initialize: function(options) {
        this.options = options;
    },

    onRender: function() {
        $('.genres-filter', this.$el).val( this.options.currentGenre );
        $('.years-filter', this.$el).val( this.options.currentYear );
    },

    serializeData: function() {
        return this.options;
    },

    filter: function() {
        var genre = $('.genres-filter', this.$el).val();
        var year = $('.years-filter', this.$el).val();

        this.trigger('media-music:filter', {genre: genre, year: year} );
        this.close();
        return false;
    }
});