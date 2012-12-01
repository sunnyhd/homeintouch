var TVShow = require('models/tvshow');
var app = require('app');

module.exports = Backbone.Collection.extend({

    model: TVShow,

    url: '/api/tvshows',

    comparator: function(show1, show2) {
        var show1Label = show1.get('label');
        var show2Label = show2.get('label');

        var result = show1Label < show2Label ? -1 : show1Label > show2Label ? 1 : 0;
        var sortSettings = app.controller('settings').mediaSettings.getSortSettings();
        var ascending = sortSettings['tvshows_order'];
        return result * (ascending ? 1 : (-1));
    }

});