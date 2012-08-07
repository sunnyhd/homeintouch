var app = require('app');
var TVShowDetailView = require('views/tvshows/tvshow_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'tvshow',
    
    template: require('templates/tvshows/tvshow_item'),

    events: {
        'click .show': 'show'
    },

    // Event Handlers

    show: function() {
        var view = new TVShowDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});