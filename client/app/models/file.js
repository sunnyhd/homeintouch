module.exports = Backbone.Model.extend({

    isDirectory: function() {
        return this.get('filetype') === 'directory';
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.directory = this.isDirectory();
        return data;
    }

});