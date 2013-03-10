var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    idAttribute: 'songid',

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

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        return data;
    }

});