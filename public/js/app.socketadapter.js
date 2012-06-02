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
    socket = io.connect();

    socket.on("connect", function() {
      SocketAdapter.connected = true;
      HIT.vent.trigger("socket:connected");
    });

    socket.on("disconnect", function() {
      SocketAdapter.connected = false;
      HIT.vent.trigger("socket:disconnected");
    });

    socket.on("eib:address", function(id, value) {
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
    socket.emit("eib:get", address);
  });

  HIT.vent.on("device:write", function(address, value){
    socket.emit("eib:set", address, value);
  });

  // HomeInTouch app initializer for socket.io
  // -----------------------------------------

  HIT.addInitializer(initialize);
  
  // Simulate address events
  // ----------------------

  // var addressSimulator = function(){
  //   console.log('triggering address');
  //   var switchValue = !!((Math.random() * 10) >= 5);
  //   var dimmerValue = parseInt(Math.random() * 255, 10);
  //   var temperature = parseInt(50 + (Math.random() * 50));
  //   var setPoint = parseInt(50 + (Math.random() * 50));
  //   var mode = (parseInt(Math.random() * 10) % 4) + 1;
  // 
  //   // light switch
  //   HIT.vent.trigger("address", "1/0/1", switchValue);
  // 
  //   // dimmer switch and value
  //   HIT.vent.trigger("address", "3/1/6", switchValue);
  //   HIT.vent.trigger("address", "3/1/9", dimmerValue);
  // 
  //   // thermostat
  //   HIT.vent.trigger("address", "3/2/3", temperature);
  //   HIT.vent.trigger("address", "3/2/4", setPoint);
  //   HIT.vent.trigger("address", "3/2/6", mode);
  // 
  //   // shutter
  //   HIT.vent.trigger("address", "4/3/8", dimmerValue);
  // };

  //setInterval(addressSimulator, 1000);

})(HomeInTouch, io);
