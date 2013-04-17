var app = require('app');
var Playable = require('models/playable');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/pictures/picture_detail'),

    className: 'picture-detail',

    events: {
        'click [data-action="play"]': 'play',
        'click [data-action="play-slideshow"]': 'playSlideshow',
        'click [data-action="parent-directory"]': 'parent'
    },

    initialize: function() {
        this.mode = this.options.mode;
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
    },

    parent: function() {
        var parent = this.model.parent();
        app.router.navigate('#pictures/' + this.mode + '/' + parent, { trigger: true });
    }

});