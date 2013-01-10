var Address = require('models/address');
var DPT_Transfomer = require('lib/dpt');

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

                var dptType = deviceAddr.get('dptType');
                if (!_.isString(value)) {
                    value = value.toString();
                }

                var decodedValue = value;
                if (dptType) {
                    decodedValue = DPT_Transfomer.getDptDecode(dptType)(value);
                }

                console.log('Current address value: ' + deviceAddr.get('value'));

                if (decodedValue === 0) {
                    var logFunction = function(){
                        console.log('Value changed to 0');
                        deviceAddr.off('change', logFunction);
                    };
                    deviceAddr.on('change', logFunction);
                    console.log('value is zero, ' + decodedValue);
                    deviceAddr.unset("value", {silent: true});    
                } else {
                    console.log('value is NOT zero, ' + decodedValue);
                    deviceAddr.set({value: 0}, {silent: true});
                }
                
                deviceAddr.set({value: decodedValue});
            };
        });
    }
});