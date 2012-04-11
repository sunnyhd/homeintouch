Backbone.Ponzi = (function(Backbone, _, $){
  var Ponzi = {};

  Ponzi.parseChildren = function(attribute, CollectionType){
    var data = this.get(attribute);

    this.unset(attribute, {silent: true});

    var collection = new CollectionType(data);
    return collection;
  }

  return Ponzi;
})(Backbone, _, $);
