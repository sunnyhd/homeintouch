var xbmc = require('../../lib/xbmc');

function getParameters(action, playerType, params) {
	switch(action) {
		case "speed":
			// the picture player doesnt support setSpeed, so we use PlayPause for that case
			if(playerType.toLowerCase() === 'picture' && (params === 0 || params === 1)) {
				return buildPayload("Player.PlayPause");
			} else {
				return buildPayload("Player.SetSpeed", {speed: params});
			}
		case "seek":
			return buildPayload("Player.Seek", {value: params});
		case "stop":
			return buildPayload("Player.Stop");
	}
}; 

function buildPayload(method, params) {
	return {
		method: method,
		params: params || {}
	};
};

exports.create = function(req, res, next) {
	var command = getParameters(req.body.action, req.body.playerType, req.body.params);

    command.params.playerid = parseInt(req.params.player, 10);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};