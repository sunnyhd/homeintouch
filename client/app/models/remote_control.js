 var RemoteControlCommand = Backbone.Model.extend({
    urlRoot : function() {
    	return '/api/remotecontrol/commands';
	},
    send: function() {
        return this.save();
    }
});

var RemoteControl = {};

RemoteControl.execute = function(command) {
	var rc = new RemoteControlCommand({action: command});
	return rc.send();
}

module.exports = RemoteControl;