module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_item')
    
});