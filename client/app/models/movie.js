var helpers = require('lib/helpers');
var Playable = require('models/playable');
var PlayableFile = require('lib/playable_file');
var Resumable = require('lib/resumable');

var Movie = module.exports = Backbone.Model.extend({

    idAttribute: 'movieid',

    url: function() {
        return '/api/movies/' + this.get('movieid');
    },

    playTrailer: function() {
        var playable = new Playable({ item: { file: this.get('trailer') }});
        return playable.save();
    },

    thumbnail: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        _.extend(data, this.resumeData());
        return data;
    }

});

// Mixins

PlayableFile.call(Movie.prototype);
Resumable.call(Movie.prototype);