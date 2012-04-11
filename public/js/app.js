var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  // Display regions
  // ---------------

  var ModalManager = Backbone.Marionette.Region.extend({
    el: "#modal",

    constructor: function(){
      _.bindAll(this);
      Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
      this.on("view:show", this.showModal, this);
      this.on("view:closed", this.hideModal, this);
    },

    showModal: function(view){
      this.$el.modal({keyboard: false});
    },

    hideModal: function(){
      this.$el.modal('hide');
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
