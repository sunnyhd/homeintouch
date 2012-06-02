(function(HIT, Backbone, _, $) {

  HIT.Router = Backbone.Router.extend({
    
    routes: {
      '': 'home',
      'home': 'home',
      'movies': 'movies'
    },
    
    home: function() {
      var home = HIT.HomeList.showCurrent();
      var floor = HIT.FloorList.showFloors(home);
    },
    
    movies: function() {
      HIT.MovieManager.showMovieList();
      HIT.movies.fetch();
    }
    
  });
  
  // Initialize
  // ---------------
  
  HIT.addInitializer(function() {
    HIT.router = new HIT.Router();
    Backbone.history.start();
  });

})(HomeInTouch, Backbone, _, $);
