var PlayableFile = require('lib/playable_file');
var Songs = require('collections/songs');

var Album = module.exports = Backbone.Model.extend({

    idAttribute: 'albumid',

    urlRoot: '/api/albums',

    initialize: function() {
        this.songs = new Songs();
    },

    thumbnail: function() {
        var id = this.get('thumbnailid');

        if (id) {
            return '/api/images/' + this.get('thumbnailid');
        }
    },

    parse: function(res) {
        this.songs || (this.songs = new Songs());
        this.songs.reset(res.songs);
        delete res.songs;
        return res;
    },

    getType: function() {
        return 'album';
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.thumbnail = this.thumbnail();
        return data;
    }

});

PlayableFile.call(Album.prototype);