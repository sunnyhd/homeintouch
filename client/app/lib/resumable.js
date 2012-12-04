var helpers = require('lib/helpers');
var Player = require('models/player');

module.exports = function() {
    this.resumeData = function() {
        var resume = this.get('resume');
        var data = { resume: !!resume && resume.position > 0 };

        if (data.resume) {
            data.resumeTime = this.getResumeTime();
        }

        return data;
    };

    this.getResumePercentage = function() {
        var resume = this.get('resume');
        return resume.position / resume.total;
    };

    this.getResumeTime = function() {
        var resume = this.get('resume');
        var time = { seconds: resume.position };
        return helpers.formatTime(helpers.normalizeTime(time));
    };

    this.resume = function(playerid) {
        var self = this;

        this.play().then(function() {
            var player = new Player({ playerid: playerid });
            var command = player.seekCommand(self.getResumePercentage());
            command.send();
        });
    }
};