module.exports = Backbone.Model.extend({
    
    idAttribute: 'playerid',

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
    }

});

// Helpers
// ---------------

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