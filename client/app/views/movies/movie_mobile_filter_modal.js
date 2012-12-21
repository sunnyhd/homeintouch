
module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/movie_mobile_dialog_filter'),

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

        this.trigger('media-movies:filter', {genre: genre, year: year} );
        this.close();
        return false;
    }
});