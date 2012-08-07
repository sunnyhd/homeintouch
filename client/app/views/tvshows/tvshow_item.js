module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'tvshow',
    
    template: require('templates/tvshows/tvshow_item')
    
});