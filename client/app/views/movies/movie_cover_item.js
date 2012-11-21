var app = require('app');
var moviesController = require('controllers/movies');
var MovieDetailView = require('views/movies/movie_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'movie',
    
    template: require('templates/movies/movie_cover_item'),

    iconNoImg: app.getBackgroundIcon('icons.media.defaultMovie', '#333'),

    events: {
        'click .movieContainer': 'show'
    },

    show: function() {
        var view = new MovieDetailView({ model: this.model });
        app.modal.show(view);
    },

    onRender: function() {
        var $noImgContainer = this.$el.find('.no-img');
        if ($noImgContainer.length > 0) {
            app.applyBackgroundIcon($noImgContainer, this.iconNoImg);
        }
    }
    
});