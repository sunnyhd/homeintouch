var xbmc = require('../../lib/xbmc');

function getParameters(action, params) {
	switch(action) {
		case "speed":
			return buildPayload("Player.SetSpeed", {speed: params});
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
	var command = getParameters(req.body.action, req.body.params);

    command.params.playerid = parseInt(req.params.player, 10);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};