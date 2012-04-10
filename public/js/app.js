var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  HIT.addRegions({
    homeList: "#home-list",
    floorList: "#floor-list",
    main: "#main-content"
  });

  // Application Initializer
  // -----------------------

  HIT.addInitializer(function(options){
    HIT.socketUrl = options.rootUrl;
  });

  return HIT;
})(Backbone, _, $);
