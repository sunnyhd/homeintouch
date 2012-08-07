module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/tvshows/tvshow_detail'),

    events: {
        'click .close': 'close'
    }

});