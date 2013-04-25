var helpers = require('lib/helpers');
var Command = require('models/player_command');

/**
 * Updates the player's percentage based of the time
 */
function updatePercentage(player, time) {
	var currentTime = helpers.timeToSeconds(time);
	var total = helpers.timeToSeconds(player.get("totaltime"));
	
	player.set("percentage", currentTime/total * 100);
};

/**
 * Turns on or off the player according to the new speed
 */
function onSpeedChanged(player, speed) {
    if(this.isPlaying()) 
        this.turnOn();
    else
        this.turnOff();
};


/**
 * Turns on the timer that updates the current play time (every 1 second)
 */
function turnOnTimer(player) {
    if(player.timerTime) turnOffTimer(player);

    var self = player;
    player.timerTime = setInterval(function() {
        var time = _.clone(self.get('time'));
        if (!time) return;
        // Updates the seconds according to the current player speed
        time.seconds += self.get("speed");
        self.set('time', helpers.normalizeTime(time));
    }, 1000);
};

/**
 * Stops the timer
 */
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
    },

    /**
     * Starts the player by turning it on
     */
    start: function() {
        if(this.isPlaying()) this.turnOn();
    },

    /**
     * Activates the player (turns on the timer)
     */
    turnOn: function() {
    	turnOnTimer(this);
        
        /*this.turnOff();
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
        }, 5000);*/
    },

    /**
     * Turns off the player
     */
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

    /**
     * Verifies is the item passed is the same as the item being played by
     * this player. It checks the id and the type of the item
     */
    isCurrentItem: function(item) {
        if(!item) return false;

        var type = item.type || item.getType();
        // When the item is a picture, there is a file attribute but no id
        var id = item.id || item.file;
        if(!id || !type) return false;

        var currentItem = this.get('item');
        return (currentItem.id === id && currentItem.getType() === type);
    },

    togglePlaying: function() {
         // Sends a setSpeed command
        if(this.isPlaying()) 
            return Command.pause(this);
        else 
            return Command.play(this);
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
        var time = this.get('time');
        if(time) return helpers.formatTime(this.get('time'));

        return '';
    },

    totalTime: function() {
        var tt = this.get('totaltime');
        if(tt) return helpers.formatTime(tt);

        return '';
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
        // Sends a seek command
    	return Command.seek(this, value);
    },

    play: function() {
    	if(!this.isPlaying()) this.togglePlaying();
    },

    pause: function() {
    	if(this.isPlaying()) this.togglePlaying();
    },
    
    stop: function() {
        // Sends a stop command
        return Command.stop(this);
    },

    next: function() {
        // Sends a next command
        return Command.next(this);
    },

    previous: function() {
        // Sends a next command
        return Command.previous(this);
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        
        data.type = this.type();
        data.currentTime = this.currentTime();
        data.totalTime = this.totalTime();
        data.playing = this.isPlaying();
        data.thumbnail = this.thumbnail();
        data.hasSpan = this.hasSpan();
        data.label = this.get('item').getLabel();

        return data;
    }
});

module.exports = Player;