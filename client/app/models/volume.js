module.exports = Backbone.Model.extend({

    url: '/api/volume',

    isNew: function() {
        return false;
    }

});