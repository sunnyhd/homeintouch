HomeInTouch.ViewHelpers = (function(HIT, Backbone, _, $){
  var ViewHelpers = {};

  ViewHelpers.getAddress = function(addressType){
    var address = _.find(this.addresses, function(addr){
      return addr.type == addressType
    });
    return address;
  };

  // apply all view helpers to the base item view's serialize data
  var itemViewPrototype = Backbone.Marionette.ItemView.prototype;
  itemViewPrototype.serializeData = _.wrap(itemViewPrototype.serializeData, function(original){
    var data = original.apply(this, arguments);
    _.extend(data, ViewHelpers);
    return data;
  });

  return ViewHelpers;
})(HomeInTouch, Backbone, _, $);
