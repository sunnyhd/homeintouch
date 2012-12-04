module.exports = function(options) {
    this.paging = {
        page: 1,
        count: 5,
        key: options.key
    };

    this.parse = function(res) {
        // Note: XBMC is returning 1 more than the real total for some reason
        this.paging.total = res.limits.total;
        this.paging.pages = Math.ceil(this.paging.total / this.paging.count);

        return res[this.paging.key];
    };

    this.fetch = function(options) {
        var start = (this.paging.page - 1) * this.paging.count;
        var end = start + this.paging.count;

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
        if (this.paging.page < this.paging.pages) {
            this.paging.page += 1;
        }
        return this.fetch();
    };
};