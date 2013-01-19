var app = require('app');
var musicController = require('controllers/music');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_cover_item'),

    events: {
        'click .artistContainer': 'show'
    },

    show: function() {
        //app.router.navigate('#music/artist/details/' + this.model.get('artistid'), {trigger: true});
    }
    
});