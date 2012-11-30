var app = require('app');
var moviesController = require('controllers/movies');
var MovieDetailView = require('views/movies/movie_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'movie',
    
    template: require('templates/movies/movie_item'),

    iconNoImg: app.getBackgroundIcon('icons.media.defaultMovie', '#333'),

    events: {
        'click .movieContainer': 'show'
    },

    show: function() {
        app.router.navigate('#movies/details/' + this.model.id, {trigger: true});
    },

    serializeData: function() {
        var number = new Number(this.model.get('rating'));
        var parsedRating = (isNaN(number)) ? '-' : number.toFixed(1);

        var data = _.extend( {}, {parsedRating: parsedRating}, this.model.toJSON() );
        return data;
    },

    onRender: function() {
        var $noImgContainer = this.$el.find('.no-img');
        if ($noImgContainer.length > 0) {
            app.applyBackgroundIcon($noImgContainer, this.iconNoImg);
        }
        // $('.movie-info', this.$el).dotdotdot({
        //     watch: 'window'
        // });
    }
    
});