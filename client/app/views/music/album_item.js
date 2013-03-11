var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'album',
    
    template: require('templates/music/album_item'),

    events: {
        'click .albumContainer': 'show'
    },

    show: function() {
        app.router.navigate('#music/albums/' + this.model.get('albumid'), {trigger: true});
    }
});