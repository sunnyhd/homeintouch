var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    idAttribute: 'songid',

    defaults: {
        type: 'song'
    },

    url: function() {
        return '/api/songs/' + this.get('songid');
    },

    play: function() {
        var playable = new Playable({ item: { file: this.get('file') }});
        return playable.save();
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