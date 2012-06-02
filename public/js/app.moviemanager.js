HomeInTouch.MovieManager = (function(HIT, Backbone, _, $) {
  
  var MovieManager = {};

  // Views
  // -----
  
  MovieManager.MovieView = Backbone.Marionette.ItemView.extend({
    
    template: '#movie-item-template'
    
  });
  
  MovieManager.MovieLayout = Backbone.Marionette.CompositeView.extend({
    
    template: '#movie-layout-template',
    
    itemView: MovieManager.MovieView,
    
    appendHtml: function(cv, iv) {
      var $movies = this.$('.movies');
      $movies.append(iv.el);
    }
    
  });
  
  // Public API
  // ----------
  
  MovieManager.showMovieList = function() {
    var view = new MovieManager.MovieLayout({
      collection: HIT.movies
    });
    
    HIT.main.show(view);
  };
  
  // Initialize
  // ----------
  
  HIT.movies = new HIT.MovieCollection();

  return MovieManager;
  
})(HomeInTouch, Backbone, _, $);
