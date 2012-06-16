module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'song',
    
    template: require('templates/music/song_item')
    
});