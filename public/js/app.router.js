(function(HIT, Backbone, _, $) {

  HIT.Router = Backbone.Router.extend({
    
    routes: {
      '': 'home',
      'home': 'home'
    },
    
    home: function() {
      var home = HIT.HomeList.showCurrent();
      var floor = HIT.FloorList.showFloors(home);
    }
    
  });
  
  // Initialize
  // ---------------
  
  HIT.addInitializer(function() {
    HIT.router = new HIT.Router();
    Backbone.history.start();
  });

})(HomeInTouch, Backbone, _, $);
