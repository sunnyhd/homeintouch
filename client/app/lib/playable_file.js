var Playable = require('models/playable');

module.exports = function() {
    this.play = function() {
        var playable = new Playable({ item: { file: this.get('file') }});
        return playable.save();
    };
};