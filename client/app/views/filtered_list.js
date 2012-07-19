module.exports = Backbone.Marionette.CompositeView.extend({

    events: {
        'change input[name=search]': 'search',
        'click .clear': 'clear'
    },

    initialize: function() {
        this.model = new Backbone.Model();
        this.bindTo(this.model, 'change', this.render, this);
    },

    addItemView: function(item, ItemView) {
        if (this.filter(item)) {
            return Backbone.Marionette.CompositeView.prototype.addItemView.apply(this, arguments);
        }
    },

    filter: function(item) {
        var strip = function(str) {
            return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
        };

        var term = this.model.get('term');
        var matchers = this.matchers(item);

        if (!_.isArray(matchers)) {
            matchers = [matchers];
        }

        if (term) {
            var regex = new RegExp(strip(term).toLowerCase());

            return _.any(matchers, function(matcher) {
                return strip(matcher).toLowerCase().match(regex);
            });
        }

        return true;
    },

    matchers: function(model) {
        return '';
    },

    // Event Handlers

    search: function() {
        var term = this.$('input[name=search]').val();
        this.model.set('term', term);
    },

    clear: function() {
        this.model.unset('term');
    }
    
});