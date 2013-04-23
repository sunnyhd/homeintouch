module.exports = Backbone.Model.extend({

    idAttribute: 'file',

    isDirectory: function() {
        return this.get('filetype') === 'directory';
    },

    parent: function() {

    	var path = this.get('file');

        var parts = _.filter(path.split('/'), function(part) {
            return part !== '';
        });

        if (parts.length === 0) return null;

        parts.pop();

        if (parts.length === 0) {
            return '/';
        } else {
            return parts.join('/') + '/';
        }
    },

    getType: function() {
        return this.get('type');
    },

    getLabel: function() {
        var label = this.get('label');
        if(label) return label;

        var path = this.get('file');

        return _.last(path.split('/'));
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.directory = this.isDirectory();
        return data;
    }

});