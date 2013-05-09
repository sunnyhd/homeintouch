var app = require('app');

// Base view for device items in the list
module.exports = Backbone.Marionette.ItemView.extend({

    events: function(){
        var events = {
            "click .device-name": "deviceClicked"
        };
        return _.extend(events, this.formEvents);
    },

    constructor: function(){
        Backbone.Marionette.ItemView.prototype.constructor.apply(this, arguments);
        this.model.addresses.each(function(address){
            var type = address.get("type");
            var address = address.get("address");
            if (/read.*/.test(type)){
                app.vent.trigger("device:read", address);
            }
        });
    },

    deviceClicked: function(e){
        e.preventDefault();
        app.vent.trigger("device:selected", this.model);
        return false;
    },

    refreshIcon: function() {
    }
});