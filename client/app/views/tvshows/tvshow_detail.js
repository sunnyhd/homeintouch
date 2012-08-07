var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/tvshows/tvshow_detail'),

    events: {
        'click .close': 'close',
        'click .episodes': 'episodes'
    },

    // Event Handlers

    episodes: function() {
        this.close();
        var url = 'tvshows/' + this.model.id;
        app.router.navigate(url, { trigger: true });
    }

});