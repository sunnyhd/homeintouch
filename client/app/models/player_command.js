 var Command = Backbone.Model.extend({
    urlRoot : function() {
    	return '/api/players/' + this.get("playerid") + '/commands';
	},
    send: function() {
        return this.save();
    }

});

Command.send = function(player, action, params) {
	var type = (player.get)?player.get('type'):player.type;
	type = type.toLowerCase();
	var cmd = new Command({playerid: player.id, playerType: type, action: action, params: params});
	return cmd.send();
} 
Command.play = function(player) {
	return Command.send(player, 'play');
}
Command.pause = function(player) {
	return Command.send(player, 'pause');
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
Command.next = function(player) {
	return Command.send(player, 'next');
}
Command.previous = function(player) {
	return Command.send(player, 'previous');
}
Command.openAt = function(playlist, position) {
	Command.send({id: 'any', type: playlist.get('type')}, 'open', {playlistid: playlist.id, position: position});
}
Command.openFile = function(path) {
	Command.send({id: 'any', type: ''}, 'open', {path: path});
}

module.exports = Command;