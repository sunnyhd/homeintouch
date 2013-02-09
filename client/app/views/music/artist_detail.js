var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    className: 'artist-detail',

    template: require('templates/music/artist_detail'),

    events: {
    },

    onRender: function() {

        // Fanart background
        var src = 'img/cinema-background.jpg';
        var fanArt = this.model.get('fanartid');
        if (fanArt && fanArt !== '') {
            src = 'api/images/' + fanArt;
        }
        app.setBackgroundImg( src );
    },

    close: function() {
        app.removeBackgroundImg();
    },

});