var mongoose = require('mongoose');

var MediaConfig = new mongoose.Schema({
    mediaconfigid: { type: Number, index: true, unique: true },
    sort: {
    	widget: String,
    	ascending: Boolean
    },
    movie_style: {
    	styleSwitch: String,
    	active: Boolean
    }
});

module.exports = mongoose.model('MediaConfig', MediaConfig);