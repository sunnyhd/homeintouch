module.exports = Backbone.Model.extend({

    url: '/api/imports',

    isNew: function() {
        return true;
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.idle = data.state === 'idle';
        return data;
    }

});