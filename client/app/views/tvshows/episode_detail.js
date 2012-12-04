var app = require('app');
var tvshowsController = require('controllers/tvshows');

module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/tvshows/episode_detail'),

    events: {
        'click .close': 'close',
        'click .play': 'play',
        'click .playlist': 'playlist',
        'click .resume': 'resume'
    },

    initialize: function() {
        this.bindTo(this.model, 'change', this.render, this);
    },

    play: function() {
        tvshowsController.play(this.model);
        this.close();
    },

    playlist: function() {
        tvshowsController.addToPlaylist(this.model);
        this.close();
    },

    resume: function() {
        tvshowsController.resume(this.model);
        this.close();
    }

});