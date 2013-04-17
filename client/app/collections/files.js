var File = require('models/file');

module.exports = Backbone.Collection.extend({

    model: File,

    url: '/api/files',

    initialize: function(models, options) {
        this.type = options.type;
        this.directory = options.directory;

        if (this.directory && this.directory[0] !== '/') {
            this.directory = '/' + this.directory;
        }
    },

    fetch: function(options) {
        options || (options = {});
        options.data || (options.data = {});
        options.data.type || (options.data.type = this.type);
        options.data.directory || (options.data.directory = this.directory);

        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    parent: function() {

        if (!this.directory) return null;

        var parts = _.filter(this.directory.split('/'), function(part) {
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

});