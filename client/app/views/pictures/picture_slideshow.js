module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_slideshow'),

    className: 'picture-slideshow',

    events: {
        'click [data-action=fullscreen]': 'fullscreen'
    },

    serializeData: function() {
        var result = {};
        result.folder = this.model.toJSON();
        result.files = this.collection.toJSON();
        if (result.files.length > 0) {
            result.files[0].firstItem = true;
        }

        return result;
    },

    fullscreen: function() {
        this.$('#pictureCarousel').get()[0].webkitRequestFullScreen();
    }

});