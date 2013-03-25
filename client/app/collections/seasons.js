var Season = require('models/season');
var app = require('app');

var Seasons = module.exports = Backbone.Collection.extend({

    model: Season,

    url: '/api/seasons',

    comparator: function(season) {
        return season.get('season');
    }

});