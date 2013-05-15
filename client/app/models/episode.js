var PlayableFile = require('lib/playable_file');
var Resumable = require('lib/resumable');

var Episode = module.exports = Backbone.Model.extend({

    idAttribute: 'episodeid',

    defaults: {
        type: 'episode'
    },

    url: function() {
        return '/api/episodes/' + this.get('episodeid');
    },

    thumbnailImage: function() {
        var url = this.get('thumbnailUrl');

        if (url) {
            return this.get('thumbnailUrl');
        }
    },

    getType: function() {
        return this.get('type');
    },

    getLabel: function() {
        return this.get('label');
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