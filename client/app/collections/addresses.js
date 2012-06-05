var Address = require('models/address');

module.exports = Backbone.Collection.extend({

    model: Address,

    initialize: function(){
        this.on("change:value", this.addressValueChanged, this);
    },

    addressValueChanged: function(address, value){
        if (this.parent){
            this.parent.trigger("change:address:value", address, value);
        }
    },

    updateAddress: function(address, value){
        this.each(function(deviceAddr){
            var addr = deviceAddr.get("address");

            if (addr === address){
                deviceAddr.set({value: value});
            };
        });
    }
});