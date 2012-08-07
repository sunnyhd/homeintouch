var app = require('app');
var TVShowItemView = require('views/tvshows/tvshow_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/tvshows/tvshow_list'),
    
    itemView: TVShowItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.tvshows').append(iv.el);
    }
    
});