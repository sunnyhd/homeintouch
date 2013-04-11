var app = require('app');
var Playable = require('models/playable');
var PictureDetailView = require('views/pictures/picture_detail');
var picturesController = require('controllers/pictures');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_item'),

    events: {
        'click [data-action="play"]': 'play',
        'click .pictureContainer': 'show'
    },

    // Event Handlers

    show: function() {
        if (this.model.get('filetype') === 'directory') {
            app.router.navigate('#pictures/list-view/' + this.model.get('file'), {trigger: true});
        } else {
            var view = new PictureDetailView({ model: this.model });
            app.modal.show(view);
        }
    },

    play: function() {
        var playable = new Playable({ item: { path: this.model.get('file') }});
        playable.save();
    }
    
});