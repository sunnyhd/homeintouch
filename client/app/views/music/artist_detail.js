var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    className: 'artist-detail',

    template: require('templates/music/artist_detail'),

    events: {
    },

    onRender: function() {

        // Fanart background
        var src = 'img/cinema-background.jpg';
        var fanArt = this.model.get('fanartUrl');
        if (fanArt && fanArt !== '') {
            src = fanArt;
        }
        app.setRepeatBackgroundImg( src );
    },

    toggleBioVisibility: function() {
        this.$(".hidden-desktop .m-plot-container p").toggleClass("show-more");
    },

    close: function() {
        app.removeBackgroundImg();
    },

});