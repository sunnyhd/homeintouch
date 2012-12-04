var app = require('app');
var ArtistDetailView = require('views/music/artist_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_item'),

    events: {
        'click .detail': 'detail'
    },

    detail: function() {
        var view = new ArtistDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});