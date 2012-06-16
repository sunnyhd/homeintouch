module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'album',
    
    template: require('templates/music/album_item')
    
});