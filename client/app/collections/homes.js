var app = require('app');
var Addresses = require('collections/addresses');
var Home = require('models/home');

module.exports = Backbone.Collection.extend({

    model: Home,
    
    defaultHome: function() {
        return this.at(0);
    },

    select: function(home){
        app.vent.trigger("home:selected", home);
    },

    findAddresses: function(address){
        var addrs = new Addresses();

        this.each(function(home){
            return home.floors.each(function(floor){
                return floor.rooms.each(function(room){
                    return room.deviceGroups.each(function(deviceGroup){
                        return deviceGroup.devices.each(function(device){
                            return device.addresses.each(function(deviceAddr){

                                var addr = deviceAddr.get("address");
                                if (addr === address){
                                    addrs.add(deviceAddr);
                                };

                            });
                        });
                    });
                });
            });
        });

        return addrs;
    }

});