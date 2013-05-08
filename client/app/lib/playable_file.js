var Command = require('models/player_command');
module.exports = function() {
    this.play = function() {
        return Command.openFile(this.get('file'));
    };
};