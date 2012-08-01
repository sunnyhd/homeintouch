var app = require('app');
var PictureDetailView = require('views/pictures/picture_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_item'),

    events: {
        'click .show': 'show'
    },

    // Event Handlers

    show: function() {
        var view = new PictureDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});