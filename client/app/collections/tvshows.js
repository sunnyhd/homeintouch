var TVShow = require('models/tvshow');

module.exports = Backbone.Collection.extend({

    model: TVShow,

    url: '/api/tvshows',

    comparator: function(show) {
        return show.get('label');
    }

});