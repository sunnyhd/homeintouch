var app = require('app');
var EpisodeItemView = require('views/tvshows/episode_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/tvshows/tvshow_episode_list'),
    
    itemView: EpisodeItemView,

    initialize: function() {
        this.collection = this.model.episodes;
        this.bindTo(this.model, 'change', this.render, this);
    },

    onRender: function() {

        // Fanart background
        var fanArt = this.model.get('fanartid');
        var src = 'img/cinema-background.jpg';
        if (fanArt && fanArt !== '') {
            src = 'api/images/' + fanArt;
        }
        app.setRepeatBackgroundImg( src );
    },

    close: function() {
        app.removeBackgroundImg();
    },
    
    appendHtml: function(cv, iv) {
        this.$('.episodes').append(iv.el);
    }
    
});