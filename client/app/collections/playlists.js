var Playlist = require('models/playlist');

module.exports = Backbone.Collection.extend({

    model: Playlist,

    url: '/api/playlists'

});