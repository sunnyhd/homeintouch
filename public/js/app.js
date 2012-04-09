var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  HIT.addRegions({
    homeList: "#home-list",
    floorList: "#floor-list"
  });

  var Model      = Backbone.Model
    , Collection = Backbone.Collection
    , View       = Backbone.View
  ;

  // Models And Collections
  // ----------------------
  
  HIT.Room = Model.extend({});
  
  HIT.RoomCollection = Collection.extend({
    model: HIT.Room
  });

  HIT.Floor = Model.extend({
    initialize: function(){
      this.parseRooms();
    },

    parseRooms: function(){
      var roomData = this.get("rooms");
      var rooms = new HIT.RoomCollection();
      if (roomData){
        rooms.reset(roomData);
      }
      this.rooms = rooms;
    }
  });

  HIT.FloorCollection = Collection.extend({
    model: HIT.Floor
  });

  HIT.Home = Model.extend({
    initialize: function(){
      this.parseFloors();
    },

    parseFloors: function(){
      var floorData = this.get("floors");
      var floors = new HIT.FloorCollection();
      if (floorData){
        floors.reset(floorData);
      }
      this.floors = floors;
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

  // Application Initializer
  // -----------------------

  HIT.addInitializer(function(options){
    HIT.socketUrl = options.rootUrl;
  });

  return HIT;
})(Backbone, _, $);
