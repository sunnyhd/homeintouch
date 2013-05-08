var helpers = require('lib/helpers');
var Command = require('models/player_command');
var PlayableFile = require('lib/playable_file');
var Resumable = require('lib/resumable');

var Movie = module.exports = Backbone.Model.extend({

    idAttribute: 'movieid',

     defaults: {
        type: 'movie'
    },

    url: function() {
        return '/api/movies/' + this.get('movieid');
    },

    playTrailer: function() {
        return Command.openFile(this.get('trailer'));
    },

    thumbnail: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    getType: function() {
        return this.get('type');
    },

    getLabel: function() {
        return this.get('label');
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.label = this.get('label');
        _.extend(data, this.resumeData());
        return data;
    }

});

// Mixins

PlayableFile.call(Movie.prototype);
Resumable.call(Movie.prototype);