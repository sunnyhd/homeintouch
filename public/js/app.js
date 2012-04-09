var HomeInTouch = (function(exports, Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  var Model      = Backbone.Model
    , Collection = Backbone.Collection
    , View       = Backbone.View

    // Models
    , App
    , Socket
    , Addresses
    , Home
    , Floor
    , Room
    , Group
    , Device

    // Collections
    , HomeList
    , FloorList
    , RoomList
    , GroupList
    , DeviceList

    // Views
    , AppView
    , HomeSelector
    , RoomSelector
    , FloorView
    , RoomView
    , GroupView
    , LightView

    , RoomModal
    , FloorModal
    , LightModal
  ;

  // Home Related Models
  // -------------------
  
  Room = Model.extend({});
  
  RoomList = Collection.extend({
    model: Room
  });

  Floor = Model.extend({
    initialize: function(){
      this.parseRooms();
    },

    parseRooms: function(){
      var roomData = this.get("rooms");
      var rooms = new RoomList();
      if (roomData){
        rooms.reset(roomData);
      }
      this.rooms = rooms;
    }
  });

  FloorList = Collection.extend({
    model: Floor
  });

  Home = Model.extend({
    initialize: function(){
      this.parseFloors();
    },

    parseFloors: function(){
      var floorData = this.get("floors");
      var floors = new FloorList();
      if (floorData){
        floors.reset(floorData);
      }
      this.floors = floors;
    }
  });

  HomeList = Collection.extend({
    model: Home
  });

  App = Model.extend({
    defaults: {
      connected: false,
      loaded: false
    },

    initialize: function() {
      this.addresses = new Model
      this.socket = new Socket

      this.view = new AppView({
        model: this,
        el: document.body
      })

      this.homes = new HomeList

      this.on("change:home", function(app, home) {
        console.log(app);
        console.log(home.get("floors"));
        home.get("floors").view.render()

      }, this)
    }
  })

  AppView = View.extend({})
  HomeList = Collection.extend({})

  Socket = Model.extend({
    initialize: function() {
      var socket = io.connect(HIT.socketUrl)

      socket.on("connect", function() {
        app.set("connected", true)
      })

      socket.on("disconnect", function() {
        app.set("connected", false)
      })

      socket.on("homes", function(homes) {
        console.log("homes", homes);
        app.homes.add(homes)
        app.set("home", app.homes.models[0])
      })

      socket.on("address", function(id, value) {
        app.addresses.set(id, value)
      })
    }
  })

  // Application Initializer
  // -----------------------

  HIT.addInitializer(function(options){
    HIT.socketUrl = options.rootUrl;
    exports.app = new App;
  });

  return HIT;
})(window, Backbone, _, $);
