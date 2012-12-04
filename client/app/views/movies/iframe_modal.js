module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/movies/iframe_modal'),

    events: {
        'click .close': 'close',
    },

    initialize: function(options) {
        this.options = options;
    },

    serializeData: function() {
        return this.options;
    }// ,

    // onRender: function() {
    //     this.$el.modal('hide');
    // },

    // initVideoPlayer: function() {
    //     if ( !_.isUndefined(this.options.video) && !_.isUndefined(this.options.videoid) ) {
    //         _V_(this.options.videoid);
    //     }
    // }

});