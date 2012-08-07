var EpisodeItemView = require('views/tvshows/episode_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/tvshows/tvshow_episode_list'),
    
    itemView: EpisodeItemView,

    initialize: function() {
        this.collection = this.model.episodes;
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.episodes').append(iv.el);
    }
    
});