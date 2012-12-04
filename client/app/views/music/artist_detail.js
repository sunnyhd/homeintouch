var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/music/artist_detail'),

    events: {
        'click .close': 'close',
        'click .albums': 'albums'
    },

    albums: function() {
        this.close();
        var url = 'artists/' + this.model.id;
        app.router.navigate(url, { trigger: true });
    }

});