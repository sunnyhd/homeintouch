module.exports = function(options) {
    this.paging = {
        page: 1,
        count: 20,
        key: options.key
    };

    this.parse = function(res) {
        this.paging.total = res.limits.total;
        return res[this.paging.key];
    };

    this.fetch = function(options) {
        var start = (this.paging.page - 1) * this.paging.count + 1;
        var end = start + this.paging.count - 1;

        options || (options = {});
        options.data || (options.data = {});
        options.data.start = start;
        options.data.end = end;

        return Backbone.Collection.prototype.fetch.call(this, options);
    };

    this.prevPage = function() {
        if (this.paging.page > 1) {
            this.paging.page -= 1;
        }

        return this.fetch();
    };

    this.nextPage = function() {
        var pages = Math.ceil(this.paging.total / this.paging.count);

        if (this.paging.page < pages) {
            this.paging.page += 1;
        }
        return this.fetch();
    };
};