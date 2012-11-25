var app = require('app');
var tvshowsController = require('controllers/tvshows');
var EpisodeDetailView = require('views/tvshows/episode_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'episode',
    
    template: require('templates/tvshows/episode_item'),

    events: {
        'click .play': 'play',
        'click .playlist': 'playlist',
        'click .details': 'details'
    },

    serializeData: function() {
        var number = new Number(this.model.get('rating'));
        var parsedRating = (isNaN(number)) ? '-' : number.toFixed(1);
        var episodeNumber = this.model.getEpisodeNumber();

        var data = _.extend( {}, {parsedRating: parsedRating, episodeNumber: episodeNumber}, this.model.toJSON() );
        return data;
    },

    play: function() {
        tvshowsController.play(this.model);
    },

    playlist: function() {
        tvshowsController.addToPlaylist(this.model);
    },

    details: function() {
        var view = new EpisodeDetailView({ model: this.model });
        app.modal.show(view);
    }
    
});