var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'season',
    
    template: require('templates/tvshows/season_item'),

    events: {
        'click .seasonContainer': 'show'
    },

    show: function() {
        app.router.navigate('#tvshows/' + this.model.get('tvshowid') + '/season/' + this.model.get('season'), {trigger: true});
    }
    
});