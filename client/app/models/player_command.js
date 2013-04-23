 var Command = Backbone.Model.extend({
    urlRoot : function() {
    	return '/api/players/' + this.get("playerid") + '/commands';
	},
    send: function() {
        return this.save();
    }

});

Command.send = function(player, action, params) {
	var cmd = new Command({playerid: player.id, playerType: player.get('type').toLowerCase(), action: action, params: params});
	return cmd.send();
} 

Command.setSpeed = function(player, speed) {
	return Command.send(player, 'speed', speed);
}
Command.seek = function(player, value) {
	return Command.send(player, 'seek', value);
}
Command.stop = function(player) {
	return Command.send(player, 'stop');
}

module.exports = Command;