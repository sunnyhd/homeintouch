var PlayableFile = require('lib/playable_file');

var Song = module.exports = Backbone.Model.extend({

    idAttribute: 'songid',

    defaults: {
        type: 'song'
    },

    url: function() {
        return '/api/songs/' + this.get('songid');
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
        return data;
    }

});

PlayableFile.call(Song.prototype);