var ArtistItemView = require('views/music/artist_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/music/artist_list'),
    
    itemView: ArtistItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.artists').append(iv.el);
    }
    
});