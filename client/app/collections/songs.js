var Song = require('models/song');

var Songs = module.exports = Backbone.Collection.extend({

    model: Song,

    url: '/api/songs'

});