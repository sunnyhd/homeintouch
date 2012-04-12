(function(HIT, Backbone, _, $){

  // Base Model And Collection
  // -------------------------

  var Model = Backbone.Model.extend({
    constructor: function(data){
      if (data && !data.id){
        data.id = _.uniqueId(this.prefix);
      }
      Backbone.Model.prototype.constructor.apply(this, arguments);
    }
  });
  _.extend(Model.prototype, Backbone.Ponzi);

  var Collection = Backbone.Collection;

  // Device Types
  // ------------
  
  HIT.DeviceType = Model.extend({
    prefix: "dt"
  });

  HIT.DeviceTypeCollection = Collection.extend({
    model: HIT.DeviceType
  });

  // Devices
  // -------

  HIT.Device = Model.extend({
    prefix: "d"
  });

  HIT.DeviceCollection = Collection.extend({
    model: HIT.Device
  });

  // Device Group
  // ------------

  HIT.DeviceGroup = Model.extend({
    prefix: "dg",

    initialize: function(){
      this.devices = this.parseChildren("devices", HIT.DeviceCollection);
      this.setDeviceType();
    },

    setDeviceType: function(){
      var typeId = this.get("type");
      var type = HIT.DeviceTypes.get(typeId);

      if (type){
        this.deviceType = type;
        this.set("name", type.get("name"));
      }
    }
  });

  HIT.DeviceGroupCollection = Collection.extend({
    model: HIT.DeviceGroup
  });
  
  // Rooms
  // -----
  
  HIT.Room = Model.extend({
    prefix: "r", 

    initialize: function(){
      this.deviceGroups = this.parseChildren("deviceGroups", HIT.DeviceGroupCollection);
    },

    findOrCreateGroup: function(deviceTypeId){
      var deviceGroup;

      deviceGroup = this.deviceGroups.find(function(dg){ 
        return dg.deviceType.id == deviceTypeId; 
      });

      if (!deviceGroup){
        deviceGroup = new HIT.DeviceGroup({
          type: deviceTypeId
        });
      }

      return deviceGroup;
    }
  });
  
  HIT.RoomCollection = Collection.extend({
    model: HIT.Room,
  });

  // Floors
  // ------

  HIT.Floor = Model.extend({
    prefix: "f",

    initialize: function(){
      this.rooms = this.parseChildren("rooms", HIT.RoomCollection);
    }
  });

  HIT.FloorCollection = Collection.extend({
    model: HIT.Floor
  });

  // Homes
  // -----

  HIT.Home = Model.extend({
    prefix: "h",

    initialize: function(){
      this.floors = this.parseChildren("floors", HIT.FloorCollection);
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
    }
  });

})(HomeInTouch, Backbone, _, $);
