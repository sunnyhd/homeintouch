var helpers = require('lib/helpers');
var XbmcCommand = require('models/xbmc_command');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'playerid',

    urlRoot: '/api/players',

    defaults: {
        item: {
            label: ''
        }
    },

    initialize: function() {
        this.on('change:speed', this.checkTimer, this);
        this.checkTimer();
    },

    checkTimer: function() {
        if (this.isPlaying()) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    },

    isPlaying: function() {
        return this.get('speed') === 1;
    },

    togglePlaying: function() {
        this.set('speed', this.isPlaying() ? 0 : 1);
    },

    hasSpan: function() {
        var tt = this.get('totaltime');

        if (!tt) return false;
        return !(tt.hours === 0 && tt.minutes === 0 && tt.seconds === 0 && tt.milliseconds === 0);
    },

    title: function() {
        var type = this.get('type');
        return type.charAt(0).toUpperCase() + type.slice(1);
    },

    currentTime: function() {
        return helpers.formatTime(this.get('time'));
    },

    totalTime: function() {
        return helpers.formatTime(this.get('totaltime'));
    },

    thumbnail: function() {
        var thumbnail = this.get('item').thumbnail;
        if (thumbnail) {
            return 'http://localhost:8080/vfs/' + thumbnail;
        }
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        
        data.title = this.title();
        data.currentTime = this.currentTime();
        data.totalTime = this.totalTime();
        data.playing = this.isPlaying();
        data.thumbnail = this.thumbnail();
        data.hasSpan = this.hasSpan();

        return data;
    },

    startTimer: function() {
        if (!this.hasSpan()) return;
        
        var self = this;
        var interval = 1000; // 1 second

        this.timer = setInterval(function() {
            var time = _.clone(self.get('time'));
            if (!time) return;

            time.seconds++;
            self.set('time', helpers.normalizeTime(time));
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
        //this.startTimer();
        this.startPolling();
    },

    shutdown: function() {
        //this.stopTimer();
        this.stopPolling();
    },

    playPauseCommand: function() {
        return new XbmcCommand({
            method: 'Player.PlayPause',
            params: { playerid: this.id }
        });
    },

    seekCommand: function(value) {
        value = Math.round(value * 100);

        return new XbmcCommand({
            method: 'Player.Seek',
            params: { playerid: this.id, value: value }
        });
    }

});