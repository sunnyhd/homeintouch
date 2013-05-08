var app = require('app');
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
            app.router.navigate('#pictures/list-view/file/' + this.model.get('file'), {trigger: true});
        }

        return false;
    },

    play: function() {
        return this.model.play();
    },

    playSlideshow: function() {
        if (this.model.isDirectory()) {
            return this.model.play();
        }

        return Q.when(false);
    },

    watchSlideshow: function() {

        app.router.navigate('#pictures/list-view/slideshow/' + this.model.get('file'), {trigger: true});

        return false;
    }
    
});