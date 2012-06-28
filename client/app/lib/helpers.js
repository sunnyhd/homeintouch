exports.normalizeTime = function(time) {
    time.seconds || (time.seconds = 0);
    time.minutes || (time.minutes = 0);
    time.hours || (time.hours = 0);

    time.seconds = Math.round(time.seconds);

    if (time.seconds >= 60) {
        time.minutes += Math.floor(time.seconds / 60);
        time.seconds = time.seconds % 60;
    }

    if (time.minutes >= 60) {
        time.hours += Math.floor(time.minutes / 60);
        time.minutes = time.minutes % 60;
    }

    return time;
};

exports.formatTime = function(time) {
    if (!time) return '';

    var components = [
        exports.zeroPad(time.hours, 2),
        exports.zeroPad(time.minutes, 2),
        exports.zeroPad(time.seconds, 2)
    ];

    return components.join(':');
};

exports.zeroPad = function(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
};