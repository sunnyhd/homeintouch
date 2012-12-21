module.exports = Backbone.Marionette.ItemView.extend({

    events: {
        'change input[name=search]': 'search',
        'click .search': 'search',
        'click .clear': 'clear'
    },

    initialize: function() {
        this.model = new Backbone.Model();
        this.bindTo(this.model, 'change', this.fireSearch, this);
    },

    // Event Handlers

    search: function(term) {

        if (_.isUndefined(term)) {
            term = this.$('input[name=search]').val();
        }
        
        this.model.set('term', term);

        this.$('button.clear').show();
        this.$('button.search').hide();
    },

    fireSearch: function() {
        this.trigger('searchFired', this.model);
    },

    clear: function() {
        this.$('input[name=search]').val('');
        this.model.set('term', '');

        this.$('button.clear').hide();
        this.$('button.search').show();
    }
    
});