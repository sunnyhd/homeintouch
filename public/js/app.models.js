(function(HIT, Backbone, _, $){

  // Base Model And Collection
  // -------------------------

  var Model = (function(){
    var idSequence = 0;

    var generateId = function(idAttribute, data){
      var id;

      if (data.hasOwnProperty(idAttribute)){

        id = data.id;
        if (_.isNumber(id) && id > idSequence){ 
          idSequence = id; 
        }

      } else {

        idSequence += 1;
        id = idSequence;

      }

      return id;
    };

    var Model = Backbone.Model.extend({
      constructor: function(data){
        if (!data){ data = {}; };
        data.id = generateId(this.idAttribute, data);

        Backbone.Model.prototype.constructor.apply(this, arguments);
      },

      destroy: function(options){
        // overriding the `destroy` function cause we're not
        // using the standard rest-ful interface of backbone.sync
        this.trigger('destroy', this, this.collection, options);
      }

    });

    _.extend(Model.prototype, Backbone.Ponzi);

    return Model;
  })();

  var Collection = Backbone.Collection;

  // Device Types
  // ------------
  
  HIT.DeviceType = Model.extend({
  });

  HIT.DeviceTypeCollection = Collection.extend({
    model: HIT.DeviceType
  });

  // Addresses
  // ---------

  HIT.Address = Model.extend({
    initialize: function(){
      if (this.get("type") === "read_address"){
        var address = this.get("address");
        HIT.vent.trigger("device:read", address);
      }
    }
  });

  HIT.AddressCollection = Collection.extend({
    model: HIT.Address,

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

  // Devices
  // -------

  HIT.Device = Model.extend({
    initialize: function(){
      this.addresses = this.parseChildren("addresses", HIT.AddressCollection);
      this.addresses.parent = this;
    },

    toJSON: function(){
      var json = Model.prototype.toJSON.call(this);
      if (this.addresses){
        json.addresses = this.addresses.toJSON();
      }
      if (this.deviceType){
        json.deviceType = this.deviceType.toJSON();
      }
      return json;
    }
  });

  HIT.DeviceCollection = Collection.extend({
    model: HIT.Device
  });

  // Device Group
  // ------------

  HIT.DeviceGroup = Model.extend({
    initialize: function(){
      this.devices = this.parseChildren("devices", HIT.DeviceCollection);
      this.setDeviceType();
    },

    setDeviceType: function(){
      var typeName = this.get("type");
      var type = HIT.DeviceTypes.getByType(typeName);

      if (type){
        this.deviceType = type;
        this.set("name", type.get("name"));
      }
    },

    toJSON: function(){
      var json = Model.prototype.toJSON.call(this);
      if (this.devices){
        json.devices = this.devices.toJSON();
      }
      return json;
    }
  });

  HIT.DeviceGroupCollection = Collection.extend({
    model: HIT.DeviceGroup
  });
  
  // Rooms
  // -----
  
  HIT.Room = Model.extend({
    initialize: function(){
      this.deviceGroups = this.parseChildren("deviceGroups", HIT.DeviceGroupCollection);
    },

    findOrCreateGroup: function(deviceType){
      var deviceGroup;

      deviceGroup = this.deviceGroups.find(function(dg){ 
        return dg.deviceType.type == deviceType; 
      });

      if (!deviceGroup){
        deviceGroup = new HIT.DeviceGroup({
          type: deviceType
        });
      }

      return deviceGroup;
    },

    toJSON: function(){
      var json = Model.prototype.toJSON.call(this);
      if (this.deviceGroups){
        json.deviceGroups = this.deviceGroups.toJSON();
      }
      return json;
    }
  });
  
  HIT.RoomCollection = Collection.extend({
    model: HIT.Room,
  });

  // Floors
  // ------

  HIT.Floor = Model.extend({
    initialize: function(){
      this.rooms = this.parseChildren("rooms", HIT.RoomCollection);
    },

    addRoom: function(room){
      this.rooms.add(room);
      this.trigger("change:rooms", this.rooms);
      this.trigger("change:room:add", room);
    },

    toJSON: function(){
      var json = Model.prototype.toJSON.call(this);
      if (this.rooms){
        json.rooms = this.rooms.toJSON();
      }
      return json;
    }
  });

  HIT.FloorCollection = Collection.extend({
    model: HIT.Floor
  });

  // Homes
  // -----

  HIT.Home = Model.extend({
    initialize: function(){
      this.floors = this.parseChildren("floors", HIT.FloorCollection);
    },

    addFloor: function(floor){
      this.floors.add(floor);
      this.trigger("change:floors", this.floors);
      this.trigger("change:floor:add", floor);
    },

    toJSON: function(){
      var json = Model.prototype.toJSON.call(this);
      if (this.floors){
        json.floors = this.floors.toJSON();
      }
      return json;
    }
  });

  HIT.HomeCollection = Collection.extend({
    model: HIT.Home,

    selectDefault: function(){
      var home = this.at(0);
      this.select(home);
    },

    select: function(home){
      this.selected = home;
      HIT.vent.trigger("home:selected", home);
    },

    findAddresses: function(address){
      var addrs = new HIT.AddressCollection();

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

})(HomeInTouch, Backbone, _, $);
