module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_detail'),

    events: {
        'click .close': 'close'
    }

});