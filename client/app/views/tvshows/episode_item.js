module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'episode',
    
    template: require('templates/tvshows/episode_item')
    
});