var Address = require('models/address');
var BaseModel = require('models/base');
var Addresses = require('collections/addresses');

module.exports = BaseModel.extend({

    initialize: function(){
        this.addresses = this.parseChildren("addresses", Addresses);
        this.addresses.parent = this;
    },

    getAddressByType: function(type){
        var addr = this.addresses.find(function(address){
            return address.get("type") === type;
        });
        
        return addr
    },

    addAddress: function(type, addr, dptType){
        if (arguments.length === 1){
            address = type;
            this.addresses.add(addr);
        } else {
            var address = new Address({
                type: type,
                address: addr,
                dptType: dptType,
                value: ""
            });

            this.addresses.add(address);
        }
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.addresses){
            json.addresses = this.addresses.toJSON();
        }
        
        if (this.deviceType){
            json.deviceType = this.deviceType.toJSON();
        }

        return json;
    }

});