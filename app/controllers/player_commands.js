var xbmc = require('../../lib/xbmc');

function getParameters(action, playerType, params) {
	switch(action) {
		case "open":
			var name = getParamName(params);
			if (name) {
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

    command.params.playerid = parseInt(req.params.player, 10);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};

exports.executeAction = function(req, res, next) {
	var command = getParameters(req.body.action, req.body.playerType, req.body.params);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};