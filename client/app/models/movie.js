var helpers = require('lib/helpers');
var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    idAttribute: 'movieid',

    play: function() {
        var playable = new Playable({ item: { file: this.get('file') }});
        return playable.save();
    },

    playTrailer: function() {
        var playable = new Playable({ item: { file: this.get('trailer') }});
        return playable.save();
    },

    thumbnail: function() {
        return 'http://localhost:8080/vfs/' + this.get('thumbnail');
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        data.resume = !!data.resume && data.resume.position > 0;

        if (data.resume) {
            data.resume = this.getResumeTime();
        }

        return data;
    },

    getResumePercentage: function() {
        var resume = this.get('resume');
        return resume.position / resume.total;
    },

    getResumeTime: function() {
        var resume = this.get('resume');
        var time = { seconds: resume.position };
        return helpers.formatTime(helpers.normalizeTime(time));
    }

});