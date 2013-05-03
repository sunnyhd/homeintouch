var xbmc = require('../../lib/xbmc');

function getParameters(action) {
	switch(action.toLowerCase()) {
		case "shut-down": return buildPayload('Application.Quit');
		case "home": return buildPayload('Input.Home');
		case "back": return buildPayload('Input.Back');

		case "left": return buildPayload('Input.Left');
		case "up": return buildPayload('Input.Up');
		case "right": return buildPayload('Input.Right');
		case "down": return buildPayload('Input.Down');

		case 'step-backward': return buildAction('stepback');
		case 'backward': return buildAction('skipprevious');
		case 'forward': return buildAction('skipnext');
		case 'step-forward': return buildAction('stepforward');
		case 'play': return buildAction('play');
		case 'pause': return buildAction('pause');
		case 'stop': return buildAction('stop');

		case "mute": return buildAction('mute');//return buildPayload('Application.SetMute', {mute: 'toggle'});
		case "volume-down": return buildAction('volumedown');//return buildPayload('Application.SetVolume', {volume: 'decrement'});
		case "volume-up": return buildAction('volumeup');//return buildPayload('Application.SetVolume', {volume: 'increment'});
	}
}; 

function buildAction(action) {
	return {
		method: 'Input.ExecuteAction',
		action: action
	};
};

function buildPayload(method, params) {
	return {
		method: method,
		params: params || {}
	};
};

exports.executeCommand = function(req, res, next) {
	var command = getParameters(req.body.action);

    xbmc.rpc(command.method, command.params || {}, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
};