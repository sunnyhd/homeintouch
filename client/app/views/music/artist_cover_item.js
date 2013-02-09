var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_cover_item'),

    events: {
        'click .artistContainer': 'show'
    },

    show: function() {
        app.router.navigate('#music/artists/' + this.model.get('artistid'), {trigger: true});
    }
    
});