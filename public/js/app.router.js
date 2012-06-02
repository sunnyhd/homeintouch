(function(HIT, Backbone, _, $){

  HIT.Router = Backbone.Router.extend({
    
    routes: {
      '': 'home',
      'home': 'home',
      'media': 'media'
    },
    
    home: function() {
      HIT.homes.selectDefault();
    }
    
  });
  
  HIT.addInitializer(function() {
    HIT.router = new HIT.Router();
    Backbone.history.start();
  });

})(HomeInTouch, Backbone, _, $);
