var File = require('models/file');

var Files = module.exports = Backbone.Collection.extend({

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

    /**
     * It returns a new collection applying filters and sort parameters.
     */
    filterAndSortBy: function(opts) {

        // Ensures the filter and sort parameters
        opts.criteria       || (opts.criteria = '');

        var items = this.models;

        // Search criteria
        if (opts.criteria !== '') {
            var regexp = new RegExp(opts.criteria, "i");

            items = _.filter(items, function(i) { 
                return regexp.test(i.get('label'));
            });
        }

        var options = {
            type: this.type,
            directory: this.directory
        };

        return new Files(items, options);
    }

});