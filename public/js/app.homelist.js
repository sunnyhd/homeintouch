HomeInTouch.HomeList = (function(HIT, Backbone, _, $){
  var HomeList = {};

  // Views
  // -----
  
  HomeList.HomeItemView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#home-item-template",

    events: {
      "click a": "homeClicked"
    },

    homeClicked: function(e){
      e.preventDefault();
      HIT.homes.select(this.model);
    }
  });

  HomeList.HomeSelector = Backbone.Marionette.CompositeView.extend({
    tagName: "li",
    className: "dropdown",
    template: "#home-list-template",
    itemView: HomeList.HomeItemView,

    events: {
      "click .add-home a": "addHomeClicked"
    },

    addHomeClicked: function(e){
      e.preventDefault();
      addNewHome();
    },

    appendHtml: function(cv, iv){
      cv.$("ul.dropdown-menu").prepend(iv.el);
    }
  });

  HomeList.AddHomeForm = Backbone.Marionette.ItemView.extend({
    template: "#add-home-template",

    events: {
      "click .add": "addClicked",
      "click .cancel": "cancelClicked"
    },

    addClicked: function(e){
      e.preventDefault();
      var name = this.$("#home-name").val();
      this.trigger("save", name);
      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });

  HomeList.ViewHomeForm = Backbone.Marionette.ItemView.extend({
    template: "#view-home-template",

    events: {
      "click .cancel": "closeClicked",
      "click .delete": "deleteClicked"
    },

    closeClicked: function(e){
      e.preventDefault();
      this.close();
    },

    deleteClicked: function(e){
      e.preventDefault();
      this.model.destroy();
      this.trigger("home:deleted", this.model);
      this.close();
    }
  });

  // Helper Methods
  // --------------

  var addNewHome = function(){
    var form = new HomeList.AddHomeForm();

    form.on("save", function(name){
      var home = new HIT.Home({
        id: name,
        name: name
      });
      HIT.homes.add(home);
      HomeList.save(home);
    });

    HIT.modal.show(form);
  };

  var showHomeList = function(selectedHome){
    HomeList.currentHome = selectedHome;

    var view = new HomeList.HomeSelector({
      model: selectedHome,
      collection: HIT.homes
    });

    HIT.homeList.show(view);
  };

  var updateDeviceStatus = function(address, statusValue){
    var addrs = HIT.homes.findAddresses(address);
    addrs.updateAddress(address, statusValue);
  }

  // Application Event Handlers
  // --------------------------

  HIT.vent.on("home:selected", showHomeList);

  HIT.vent.on("address", updateDeviceStatus);

  HIT.vent.on("home:view", function(home){
    var form = new HomeList.ViewHomeForm({
      model: home
    });

    form.on("home:deleted", function(deletedHome){
      HomeList.destroy(deletedHome);

      var home = HIT.homes.at(0);
      HIT.vent.trigger('home:selected', home);
    });

    HIT.modal.show(form);
  });

  // Public API
  // ----------

  HomeList.saveCurrentHome = function(){
    HomeList.save(HomeList.currentHome);
  };

  HomeList.save = function(home){
    home.save();
  };

  HomeList.destroy = function(home){
    home.destroy();
  };

  // Initializer
  // -----------
  
  HIT.homes = new HIT.HomeCollection();
  
  HIT.addInitializer(function(options) {
    HIT.homes.reset(options.homes);
  });

  return HomeList;
})(HomeInTouch, Backbone, _, $);
