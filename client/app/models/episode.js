var PlayableFile = require('lib/playable_file');
var Resumable = require('lib/resumable');

var Episode = module.exports = Backbone.Model.extend({

    idAttribute: 'episodeid',

    thumbnailImage: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    getEpisodeNumber: function() {

        var episodeString = '';
        if (this.has('episode')) {
            episodeString = this.get('episode').toString();
            if (episodeString.length < 2) {
                episodeString = '0' + episodeString;
            }
        }
        
        return episodeString;
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        _.extend(data, this.resumeData());
        data.thumbnailImage = this.thumbnailImage();
        return data;
    }

});

// Mixins

PlayableFile.call(Episode.prototype);
Resumable.call(Episode.prototype);