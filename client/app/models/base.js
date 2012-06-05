var idSequence = 0;

var generateId = function(idAttribute, data){
    var id;

    if (data.hasOwnProperty(idAttribute)){
        id = data.id;
        
        if (_.isNumber(id) && id > idSequence){ 
            idSequence = id; 
        }
    } else {
        idSequence += 1;
        id = idSequence;
    }

    return id;
};

var Model = Backbone.Model.extend({
    constructor: function(data){
        if (!data){ data = {}; };
        data.id = generateId(this.idAttribute, data);

        Backbone.Model.prototype.constructor.apply(this, arguments);
    },

    destroy: function(options){
        // overriding the `destroy` function cause we're not
        // using the standard rest-ful interface of backbone.sync
        this.trigger('destroy', this, this.collection, options);
    }

});

_.extend(Model.prototype, Backbone.Ponzi);

module.exports = Model;