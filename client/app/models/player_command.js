 var Command = Backbone.Model.extend({
    urlRoot : function() {
    	return '/api/players/' + this.get("playerid") + '/commands';
	},
    send: function() {
        return this.save();
    }

});

/**
 * Used when opening an item
 */
var playlistIds;
Command.setPlaylistIds = function(ids) {
	playlistIds = ids;
}

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
	Command.send({id: 'any', type: ''}, 'open', {file: path});
}
Command.openDirectory = function(path) {
    Command.send({id: 'any', type: ''}, 'open', {path: path});
}
Command.openItem = function(type, item) {
	var playlistId = getPlaylistIdForItemType(type);
	Command.send({id: playlistId, type: ''}, 'open', item);
}

function getPlaylistIdForItemType(type) {
    return playlistIds[itemTypeToPlaylistType(type)];
};

function itemTypeToPlaylistType(type) {
    switch(type.toLowerCase()) {
        case 'movie':
        case 'episode':
        case 'season':
        case 'tvshow':
            return 'video';

        case 'album':
        case 'artist':
        case 'song':
            return 'audio';

        case 'file':
        case 'picture':
            return 'picture';
    }

    return '';
};

module.exports = Command;