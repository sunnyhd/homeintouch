var xbmc = require('../../lib/xbmc');
var Promise = require('../../lib/promise');

function getParameters(action, playerType, params) {
	switch(action) {
		case "open":
			var name = getParamName(params);
			if (name) {
				//TODO This is required for windows xbmc, it should be tested on other OSes
                params[name] = params[name].replace(/\//g, '\\');
            }
			return buildPayload('Player.Open', {item: params});
		case "play":
			return buildSpeedCommand(playerType, 1);
		case "pause":
			return buildSpeedCommand(playerType, 0);
		case "speed":
			return buildSpeedCommand(playerType, params);
		case "seek":
			return buildPayload("Player.Seek", {value: params});
		case "stop":
			return buildPayload("Player.Stop");
		case "next":
		case "previous":
			return buildPayload("Player.GoTo", {to: action});
	}
}; 

function getParamName(params) {
	if(params.file) return 'file';
	return null;
}

function buildSpeedCommand(playerType, speed) {
	// the picture player doesnt support setSpeed, so we use PlayPause for that case
	if(playerType.toLowerCase() === 'picture' && (speed === 0 || speed === 1)) {
		return buildPayload("Player.PlayPause");
	} else {
		return buildPayload("Player.SetSpeed", {speed: speed});
	}
};

function buildPayload(method, params) {
	return {
		method: method,
		params: params || {}
	};
};

exports.executeActionOnPlayer = function(req, res, next) {
	var command = getParameters(req.body.action, req.body.playerType, req.body.params);
	var promise;
	if(req.body.action === 'open') {
		// Used when opening an item (all the other types of opening - file, playlist position - use executionAction())
		promise = openItem(parseInt(req.params.player, 10), command.params.item);
	} else {
		// All commands except open
    	command.params.playerid = parseInt(req.params.player, 10);

    	promise = Promise.asPromise(xbmc, xbmc.rpc, command.method, command.params || {});
	}

	promise.then(function(results) {
		res.json(results);
	})
	.fail(function(err) {
		return next(err);
	})
	.done();
    
};

exports.executeAction = function(req, res, next) {
	var command = getParameters(req.body.action, req.body.playerType, req.body.params);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

/**
 * Opens an item by executing the following actions:
 * - Clears the playlist
 * - Add the items to the playlist
 * - Opens the first item in the playlist
 */
function openItem(playlistId, item) {
	var params = {
		playlistid: parseInt(playlistId, 10)
	};
	return Promise.asPromise(xbmc, xbmc.rpc, 'Playlist.Clear', params)
	.then(function(results) {
		params.item =  item;
		return Promise.asPromise(xbmc, xbmc.rpc, 'Playlist.Add', params);
	})
	.then(function(results) {
		return Promise.asPromise(xbmc, xbmc.rpc, 'Player.Open', {item: {playlistid: params.playlistid, position: 0}});
	});

	
}