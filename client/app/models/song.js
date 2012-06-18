var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    idAttribtue: 'songid',

    play: function() {
        var playable = new Playable({ item: { file: this.get('file') }});
        return playable.save();
    }

});