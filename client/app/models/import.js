module.exports = Backbone.Model.extend({

    url: function() {
    	var urlRoot = '/api/imports'
    	
    	if (this.has('mediaType')) {
    		return urlRoot + '/' + this.get('mediaType');
    	} else {
    		return urlRoot;
    	}
    },

    isNew: function() {
        return true;
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.idle = data.state === 'idle';
        return data;
    }

});