var helpers = require('lib/helpers');
var Command = require('models/player_command');

function updatePercentage(player, time) {
	var currentTime = helpers.timeToSeconds(time);
	var total = helpers.timeToSeconds(player.get("totaltime"));
	
	player.set("percentage", currentTime/total * 100);
};

function onSpeedChanged(player, speed) {
    if(this.isPlaying()) 
        this.turnOn();
    else
        this.turnOff();
};


function turnOnTimer(player) {
    if(player.timerTime) turnOffTimer(player);

    var self = player;
    player.timerTime = setInterval(function() {
        var time = _.clone(self.get('time'));
        if (!time) return;
        time.seconds += self.get("speed");
        self.set('time', helpers.normalizeTime(time));
    }, 1000);
};

function turnOffTimer(player) {
    if(player.timerTime){
        clearInterval(player.timerTime);
        player.timerTime = null;
    }
};

var Player = Backbone.Model.extend({
    
    idAttribute: 'playerid',

    urlRoot: '/api/players',

    defaults: {
        item: {
            label: ''
        }
    },

    initialize: function() {
    	this.on('change:time', updatePercentage);
        this.on('change:speed', onSpeedChanged);
        //this.on('change', function() { alert("a") });
        if(this.isPlaying()) this.turnOn();
    },

    turnOn: function() {
    	turnOnTimer(this);
        
        this.turnOff();
        var self = this;
        this.timerAdjust = setInterval(function() {
            
            var item = self.get('item');
            
            self.fetch({silent: true})
            .then(function() {
                self.set('item', item, {silent: true});
                turnOffTimer(self);
                turnOnTimer(self);
                //self.trigger('change');    
            });
            
            //
        }, 5000);
    },

    turnOff: function() {
    	turnOffTimer(this);

        if(this.timerAdjust) {
            clearInterval(this.timerAdjust);
            this.timerAdjust = null;
        }
    },

    isPlaying: function() {
        return this.get('speed') !== 0;
    },

    togglePlaying: function() {
        return Command.setSpeed(this.id, this.isPlaying() ? 0 : 1);
    },

    hasSpan: function() {
        var tt = this.get('totaltime');

        if (!tt) return false;
        return !(tt.hours === 0 && tt.minutes === 0 && tt.seconds === 0 && tt.milliseconds === 0);
    },

    type: function() {
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
        var id = this.get('item').get('thumbnailid');

        if (id) {
            return '/api/images/' + id;
        } else {
            return '';
        }
    },

    seek: function(percentage) {
    	var value = Math.round(percentage * 100);
    	return Command.seek(this.id, value);
    },

    play: function() {
    	if(!this.isPlaying()) this.togglePlaying();
    },

    pause: function() {
    	if(this.isPlaying()) this.togglePlaying();
    },
    
    stop: function() {
        return Command.stop(this.id);
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        
        data.type = this.type();
        data.currentTime = this.currentTime();
        data.totalTime = this.totalTime();
        data.playing = this.isPlaying();
        data.thumbnail = this.thumbnail();
        data.hasSpan = this.hasSpan();

        return data;
    }
});

module.exports = Player;