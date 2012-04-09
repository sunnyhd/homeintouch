HomeInTouch.HomeList = (function(HIT, Backbone, _, $){
  var HomeList = {};

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

  // Helper Methods
  // --------------

  var showHomeList = function(selectedHome){
    var view = new HomeSelector({
      model: selectedHome,
      collection: HIT.homes
    });

    HIT.homeList.show(view);
  };

  // Application Event Handlers
  // --------------------------

  HIT.vent.on("homes", function(homeData) {
    HIT.homes.reset(homeData);
    HIT.homes.selectDefault();
  }, this)

  HIT.vent.on("home:selected", showHomeList);

  // Initializer
  // -----------

  HIT.addInitializer(function(options){
    HIT.homes = new HIT.HomeCollection();
  });

  return HomeList;
})(HomeInTouch, Backbone, _, $);
