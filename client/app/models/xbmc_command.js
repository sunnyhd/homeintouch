module.exports = Backbone.Model.extend({

    url: '/api/commands',

    send: function() {
        this.save();
    }

});