var app = require('app');
var EpisodeDetailView = require('views/tvshows/episode_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'episode',
    
    template: require('templates/tvshows/episode_item'),

    events: {
        'click .details': 'details'
    },

    // Event Handlers

    details: function() {
        var view = new EpisodeDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});