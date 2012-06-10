var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    idAttribute: 'movieid',

    play: function() {
        var playable = new Playable({ item: { file: this.get('file') }});
        return playable.save();
    },

    thumbnail: function() {
        return 'http://localhost:8080/vfs/' + this.get('thumbnail');
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        return data;
    }

});