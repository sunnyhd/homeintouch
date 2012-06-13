var XbmcCommand = require('models/xbmc_command');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'playerid',

    rootUrl: '/api/players',

    defaults: {
        item: {
            label: ''
        }
    },

    title: function() {
        var type = this.get('type');
        return type.charAt(0).toUpperCase() + type.slice(1);
    },

    currentTime: function() {
        return formatTime(this.get('time'));
    },

    totalTime: function() {
        return formatTime(this.get('totaltime'));
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        
        data.title = this.title();
        data.currentTime = this.currentTime();
        data.totalTime = this.totalTime();

        return data;
    },

    startTimer: function() {
        var self = this;
        var interval = 1000; // 1 second

        this.timer = setInterval(function() {
            var time = _.clone(self.get('time'));
            if (!time) return;

            time.seconds++;
            self.set('time', normalizeTime(time));
            console.log('Player position:', self.currentTime());
        }, interval);
    },

    stopTimer: function() {
        clearInterval(this.timer);
        this.timer = undefined;
    },

    startPolling: function() {
        var self = this;
        var interval = 10000; // 10 minutes

        this.polling = setInterval(function() {
            self.fetch();
        }, interval);
    },

    stopPolling: function() {
        clearInterval(this.polling);
        this.polling = undefined;
    },

    run: function() {
        this.startTimer();
        this.startPolling();
    },

    shutdown: function() {
        this.stopTimer();
        this.stopPolling();
    },

    playPauseCommand: function() {
        return new XbmcCommand({
            method: 'Player.PlayPause',
            params: { playerid: this.id }
        });
    }

});

// Helpers
// ---------------

function normalizeTime(time) {
    if (time.seconds >= 60) {
        time.minutes += Math.floor(time.seconds / 60);
        time.seconds = time.seconds % 60;
    }

    if (time.minutes >= 60) {
        time.hours += Math.floor(time.minutes / 60);
        time.minutes = time.minutes % 60;
    }

    return time;
}

function formatTime(time) {
    if (!time) return '';

    var components = [
        zeroPad(time.hours, 2),
        zeroPad(time.minutes, 2),
        zeroPad(time.seconds, 2)
    ];

    return components.join(':');
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
}