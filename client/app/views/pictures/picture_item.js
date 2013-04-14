var app = require('app');
var Playable = require('models/playable');
var PictureDetailView = require('views/pictures/picture_detail');
var PictureSlideshowView = require('views/pictures/picture_slideshow');
var picturesController = require('controllers/pictures');
var Files = require('collections/files');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_item'),

    events: {
        'click [data-action="play"]': 'play',
        'click [data-action="play-slideshow"]': 'playSlideshow',
        'click [data-action="watch-slideshow"]': 'watchSlideshow',
        'click .pictureContainer': 'show'
    },

    // Event Handlers

    show: function() {
        if (this.model.get('filetype') === 'directory') {
            app.router.navigate('#pictures/list-view/' + this.model.get('file'), {trigger: true});
        } else {
            var view = new PictureDetailView({ model: this.model });
            app.main.show(view);
        }

        return false;
    },

    play: function() {
        var playable = new Playable({ item: { path: this.model.get('file') }});
        playable.save();

        return false;
    },

    playSlideshow: function() {
        if (this.model.get('filetype') === 'directory') {
            var playable = new Playable({ item: { path: this.model.get('file') }});
            playable.save();
        }

        return false;
    },

    watchSlideshow: function() {

        var pictures = new Files([], { type: 'pictures', directory: this.model.get('file') });

        var model = this.model;

        var options = {
            success: function(collection, response, options) {
                var view = new PictureSlideshowView({model: model, collection: collection});
                app.main.show(view);
            }
        };

        pictures.fetch(options);

        return false;
    }
    
});