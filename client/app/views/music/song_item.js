module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'song',
    
    template: require('templates/music/song_item'),

    events: {
        'click .play': 'play'
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    }
    
});