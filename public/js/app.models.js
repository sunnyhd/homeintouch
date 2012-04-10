(function(HIT, Backbone, _, $){
  var Model = Backbone.Model.extend({});
  _.extend(Model.prototype, Backbone.Ponzi);

  var Collection = Backbone.Collection;

  // Models And Collections
  // ----------------------
  
  HIT.Device = Model.extend({});

  HIT.DeviceCollection = Collection.extend({
    model: HIT.Device
  });
  
  HIT.Room = Model.extend({
    initialize: function(){
      this.devices = this.parseChildren("devices", HIT.DeviceCollection);
    }
  });
  
  HIT.RoomCollection = Collection.extend({
    model: HIT.Room,
  });

  HIT.Floor = Model.extend({
    initialize: function(){
      this.rooms = this.parseChildren("rooms", HIT.RoomCollection);
    }
  });

  HIT.FloorCollection = Collection.extend({
    model: HIT.Floor
  });

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
