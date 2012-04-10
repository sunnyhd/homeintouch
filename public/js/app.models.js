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
  
  // Devices
  // -------

  HIT.Device = Model.extend({});

  HIT.DeviceCollection = Collection.extend({
    model: HIT.Device,

    byType: function(){
      var that = this;
      var deviceTypeCollection = new Backbone.Collection();

      var deviceTypeGroups = this.groupBy(function(device){ 
        return device.get("type");
      });

      _.each(deviceTypeGroups, function(group, typeId){
        var typeName = HIT.DeviceTypes.getName(typeId);
        var deviceType = new Backbone.Model({name: typeName});
        deviceType.devices = new Backbone.Collection(group);
        deviceTypeCollection.add(deviceType);
      });

      return deviceTypeCollection;
    }
  });

  // Rooms
  // -----
  
  HIT.Room = Model.extend({
    initialize: function(){
      this.devices = this.parseChildren("devices", HIT.DeviceCollection);
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
