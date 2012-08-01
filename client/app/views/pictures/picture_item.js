var app = require('app');
var Playable = require('models/playable');
var PictureDetailView = require('views/pictures/picture_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_item'),

    events: {
        'click .show': 'show',
        'click .play': 'play'
    },

    // Event Handlers

    show: function() {
        var view = new PictureDetailView({ model: this.model });
        app.modal.show(view);
    },

    play: function() {
        var playable = new Playable({ item: { file: this.model.get('file') }});
        playable.save();
    }
    
});