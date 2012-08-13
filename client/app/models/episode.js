var PlayableFile = require('lib/playable_file');
var Resumable = require('lib/resumable');

var Episode = module.exports = Backbone.Model.extend({

    idAttribute: 'episodeid',

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        _.extend(data, this.resumeData());
        return data;
    }

});

// Mixins

PlayableFile.call(Episode.prototype);
Resumable.call(Episode.prototype);