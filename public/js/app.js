var HomeInTouch = (function(Backbone, _, $){

  // Core application object
  // -----------------------
  var HIT = new Backbone.Marionette.Application();

  // EIBD <-> Decimal conversion
  HIT.eibdToDecimal = function (n){return (n - 0x800) / 0x32 };
  HIT.decimalToEibd = function (n){return n * 0x32 + 0x800 };

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
      view.close = _.once(view.close);
      view.on("close", this.hideModal, this);
      this.$el.modal({
        keyboard: false,
        backdrop: "static"
      });
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
