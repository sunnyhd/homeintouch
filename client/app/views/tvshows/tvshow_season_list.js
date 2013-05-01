var app = require('app');
var SeasonItemView = require('views/tvshows/season_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/tvshows/tvshow_season_list'),
    
    itemView: SeasonItemView,

    initialize: function() {
        this.collection = this.model.seasons;
        this.bindTo(this.model, 'change', this.render, this);
    },

    onRender: function() {

        // Fanart background
        var fanArt = this.model.get('fanartUrl');
        var src = 'img/cinema-background.jpg';
        if (fanArt && fanArt !== '') {
            src = fanArt;
        }
        app.setRepeatBackgroundImg( src );
    },

    close: function() {
        app.removeBackgroundImg();
    },
    
    appendHtml: function(cv, iv) {
        this.$('.seasons').append(iv.el);
    }
    
});