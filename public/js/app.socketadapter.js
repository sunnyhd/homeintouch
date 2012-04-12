HomeInTouch.SocketAdapter = (function(HIT, io){
  var SocketAdapter = {};
  var socket;

  // Socket.io Adapter
  // ------------------------
  
  // This adapter forwards all socket.io events
  // to the application's event aggregator. The
  // intention of this is to decouple the specific
  // websockets implementation from the application's
  // use of it.

  var initialize = function() {
    socket = io.connect(HIT.socketUrl);

    var homesLoaded = $.Deferred();
    var deviceTypesLoaded = $.Deferred();

    $.when(homesLoaded, deviceTypesLoaded).then(function(homes, deviceTypes){
      HIT.vent.trigger('deviceTypes', deviceTypes);
      HIT.vent.trigger("homes", homes);
    });

    socket.on("connect", function() {
      SocketAdapter.connected = true;
      HIT.vent.trigger("socket:connected");
    });

    socket.on("disconnect", function() {
      SocketAdapter.connected = false;
      HIT.vent.trigger("socket:disconnected");
    });

    socket.on("homes", function(homes) {
      homesLoaded.resolve(homes);
    });

    socket.on("deviceTypes", function(deviceTypes){
      deviceTypesLoaded.resolve(deviceTypes);
    });

    socket.on("address", function(id, value) {
      console.log("address: ", id, value);
      HIT.vent.trigger("address", id, value);
    });

    socket.on("error", function(err){
      console.log("ERROR: ", err);
    });
  };

  // App events that trigger Socket communications
  // ---------------------------------------------

  HIT.vent.on("device:read", function(address){
    socket.emit("get", address);
  });

  HIT.vent.on("device:write", function(address, value){
    socket.emit("set", address, value);
  });

  HIT.vent.on("home:save", function(home){
    socket.emit("save", home);
  });

  // HomeInTouch app initializer for socket.io
  // -----------------------------------------

  HIT.addInitializer(initialize);

})(HomeInTouch, io);
