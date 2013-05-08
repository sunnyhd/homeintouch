var Command = require('models/player_command');
module.exports = function() {
    this.play = function() {
    	var item = {};
    	item[this.idAttribute] = this.id;
        return Command.openItem(this.getType(), item);
    };
};