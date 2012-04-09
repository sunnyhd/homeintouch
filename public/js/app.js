var HomeInTouch = (function(exports, Backbone, _, $){

  // Core application object
  // -----------------------
  var hit = new Backbone.Marionette.Application();

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
        home.floors.view.render()

      }, this)
    }
  })

  AppView = View.extend({})
  HomeList = Collection.extend({})

  Socket = Model.extend({
    initialize: function() {
      var socket = io.connect("http://trendsetterin.selfhost.eu:8081")

      socket.on("connect", function() {
        app.set("connected", true)
      })

      socket.on("disconnect", function() {
        app.set("connected", false)
      })

      socket.on("homes", function(homes) {
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

  hit.addInitializer(function(options){
    exports.app = new App;
  });

  return hit;
})(window, Backbone, _, $);
