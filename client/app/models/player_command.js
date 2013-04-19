 var Command = Backbone.Model.extend({
    urlRoot : function() {
    	return '/api/players/' + this.get("playerid") + '/commands';
	},
    send: function() {
        return this.save();
    }

});

Command.send = function(playerid, action, params) {
	var cmd = new Command({playerid: playerid, action: action, params: params});
	return cmd.send();
} 

Command.setSpeed = function(playerid, speed) {
	return Command.send(playerid, 'speed', speed);
}
Command.seek = function(playerid, value) {
	return Command.send(playerid, 'seek', value);
}
Command.stop = function(playerid) {
	return Command.send(playerid, 'stop');
}

module.exports = Command;