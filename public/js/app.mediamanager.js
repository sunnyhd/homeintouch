HomeInTouch.MediaManager = (function(HIT, Backbone, _, $) {
  
  var MediaManager = {};

  // Views
  // -----

  MediaManager.MenuView = Backbone.Marionette.ItemView.extend({

    className: 'nav',

    tagName: 'ul',

    template: '#media-menu-template'

  });
  
  MediaManager.MovieView = Backbone.Marionette.ItemView.extend({
    
    template: '#movie-item-template'
    
  });
  
  MediaManager.MovieLayout = Backbone.Marionette.CompositeView.extend({
    
    template: '#movie-layout-template',
    
    itemView: MediaManager.MovieView,
    
    appendHtml: function(cv, iv) {
      this.$('.movies').append(iv.el);
    }
    
  });
  
  // Public API
  // ----------

  MediaManager.showMediaMenu = function() {
    var view = new MediaManager.MenuView();
    HIT.navList.show(view);
  };
  
  MediaManager.showMovieList = function() {
    var view = new MediaManager.MovieLayout({
      collection: HIT.movies
    });
    
    HIT.main.show(view);
  };
  
  // Initialize
  // ----------
  
  HIT.movies = new HIT.MovieCollection();

  return MediaManager;
  
})(HomeInTouch, Backbone, _, $);
