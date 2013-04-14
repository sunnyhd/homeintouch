module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_detail'),

    className: 'picture-detail',

    events: {
        'click [data-action="play"]': 'play',
        'click [data-action="play-slideshow"]': 'playSlideshow'
    },

    play: function() {
        var playable = new Playable({ item: { path: this.model.get('file') }});
        playable.save();

        return false;
    },

    playSlideshow: function() {
        var playable = new Playable({ item: { path: this.model.get('file') }});
        playable.save();

        return false;
    }

});