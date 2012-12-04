var app = require('app');
var tvShowController = require('controllers/tvshows');
var TVShowDetailView = require('views/tvshows/tvshow_episode_list');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'tvshow',
    
    template: require('templates/tvshows/tvshow_item'),

    events: {
        'click .show': 'show'
    },

    serializeData: function() {
        var number = new Number(this.model.get('rating'));
        var parsedRating = (isNaN(number)) ? '-' : number.toFixed(1);

        var data = _.extend( {}, {parsedRating: parsedRating}, this.model.toJSON() );
        return data;
    },

    show: function() {
        app.router.navigate(('#tvshows/' + this.model.get('tvshowid')), {trigger: true});
    }
    
});