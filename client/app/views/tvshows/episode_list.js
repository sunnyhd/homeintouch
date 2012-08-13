var EpisodeItemView = require('views/tvshows/episode_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/tvshows/episode_list'),
    
    itemView: EpisodeItemView,
    
    appendHtml: function(cv, iv) {
        this.$('.episodes').append(iv.el);
    }
    
});