var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  HIT.addRegions({
    homeList: "#home-select-list"
  });

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
    , HomeItemView
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
    model: Home,

    selectDefault: function(){
      var home = this.at(0);
      this.select(home);
    },

    select: function(home){
      this.selected = home;
      this.trigger("home:selected", home);
    }
  });

  // Views
  // -----
  
  HomeItemView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#home-item-template"
  });

  HomeSelector = Backbone.Marionette.CompositeView.extend({
    tagName: "li",
    className: "dropdown",
    template: "#home-list-template",
    itemView: HomeItemView,

    appendHtml: function(cv, iv){
      cv.$("ul.dropdown-menu").append(iv.el);
    }
  })

  // Application Event Handlers
  // --------------------------

  HIT.vent.on("homes", function(homeData) {
    console.log(homeData);
    HIT.homes.reset(homeData);
    HIT.homes.selectDefault();
  }, this)

  // Helper Methods
  // --------------

  var showHomeList = function(selectedHome){
    console.log(selectedHome);
    var view = new HomeSelector({
      model: selectedHome,
      collection: HIT.homes
    });

    HIT.homeList.show(view);
  };

  // Application Initializer
  // -----------------------

  HIT.addInitializer(function(options){
    HIT.socketUrl = options.rootUrl;

    HIT.homes = new HomeList();
    HIT.homes.on("home:selected", showHomeList);
  });

  return HIT;
})(Backbone, _, $);
