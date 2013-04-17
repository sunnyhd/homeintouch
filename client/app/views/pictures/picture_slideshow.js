var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_slideshow'),

    className: 'picture-slideshow',

    events: {
        'click [data-action=fullscreen]': 'fullscreen',
        'click [data-action="back-folder"]': 'backToFolder'
    },

    initialize: function() {
        this.mode = this.options.mode;
    },

    serializeData: function() {
        var result = {};
        result.files = this.collection.toJSON();
        if (result.files.length > 0) {
            result.files[0].firstItem = true;
        }

        return result;
    },

    fullscreen: function() {
        this.$('#pictureCarousel').get()[0].webkitRequestFullScreen();
    },

    backToFolder: function() {

        var parent;

        if (this.mode === 'cover-view') {
            parent = this.collection.directory;
        } else {
            parent = this.collection.parent();
        }

        app.router.navigate('#pictures/' + this.mode + '/' + parent, { trigger: true });
    }

});