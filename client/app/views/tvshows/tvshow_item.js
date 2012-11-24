var app = require('app');
var TVShowDetailView = require('views/tvshows/tvshow_detail');

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
        var view = new TVShowDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});