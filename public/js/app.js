var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  // Display regions
  // ---------------

  var ModalManager = Backbone.Marionette.Region.extend({
    el: "#modal",

    constructor: function(){
      Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
      this.on("view:show", this.showModal, this);
    },

    showModal: function(view){
      this.$el.modal();
    }
  });

  HIT.addRegions({
    homeList: "#home-list",
    floorList: "#floor-list",
    main: "#main-content",
    modal: ModalManager
  });

  // Application Initializer
  // -----------------------

  HIT.addInitializer(function(options){
    HIT.socketUrl = options.rootUrl;
  });

  return HIT;
})(Backbone, _, $);
