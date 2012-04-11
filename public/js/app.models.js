(function(HIT, Backbone, _, $){
  var Collection = Backbone.Collection;
  var Model = Backbone.Model.extend({});
  _.extend(Model.prototype, Backbone.Ponzi);

  // Device Types
  // ------------
  
  HIT.DeviceType = Model.extend({});

  HIT.DeviceTypeCollection = Collection.extend({
    model: HIT.DeviceType
  });

  // Device Group
  // ------------

  HIT.DeviceGroup = Model.extend({
  });

  HIT.DeviceGroupCollection = Collection.extend({
    model: HIT.DeviceGroup
  });
  
  // Devices
  // -------

  HIT.Device = Model.extend({});

  HIT.DeviceCollection = Collection.extend({
    model: HIT.Device

  }, {

    byType: function(devices){
      var deviceGroupCollection = new HIT.DeviceGroupCollection();

      var deviceTypeGroups = devices.groupBy(function(device){ 
        return device.get("type");
      });

      _.each(deviceTypeGroups, function(group, typeId){
        var deviceType = HIT.DeviceTypes.get(typeId);

        var deviceGroup = new HIT.DeviceGroup({name: deviceType.get("name")});
        deviceGroup.deviceType = deviceType;
        deviceGroup.devices = new HIT.DeviceCollection(group);
        
        deviceGroupCollection.add(deviceGroup);
      });

      return deviceGroupCollection;
    }
  });

  // Rooms
  // -----
  
  HIT.Room = Model.extend({
    initialize: function(){
      this.deviceGroups = this.parseDevices();
    },

    parseDevices: function(){
      var devices = this.parseChildren("devices", HIT.DeviceCollection);
      return HIT.DeviceCollection.byType(devices);
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
