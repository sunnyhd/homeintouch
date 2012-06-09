var Movie = require('models/movie');

module.exports = Backbone.Collection.extend({

    model: Movie,

    url: '/api/movies',

    paging: {
        page: 1,
        count: 20
    },

    parse: function(res) {
        this.paging.total = res.limits.total;

        return res.movies;
    },

    fetch: function(options) {
        var start = (this.paging.page - 1) * this.paging.count + 1;
        var end = start + this.paging.count - 1;

        options || (options = {});
        options.data || (options.data = {});
        options.data.start = start;
        options.data.end = end;

        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    prevPage: function() {
        if (this.paging.page > 1) {
            this.paging.page -= 1;
            return this.fetch();
        }
    },

    nextPage: function() {
        var pages = Math.ceil(this.paging.total / this.paging.count);
        if (this.paging.page < pages) {
            this.paging.page += 1;
        }
        return this.fetch();
    }

});