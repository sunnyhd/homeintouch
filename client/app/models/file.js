module.exports = Backbone.Model.extend({

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
            return '/' + parts.join('/') + '/';
        }
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.directory = this.isDirectory();
        return data;
    }

});