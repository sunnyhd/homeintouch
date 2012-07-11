var MovieItemView = require('views/movies/movie_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/movies/movie_list'),
    
    itemView: MovieItemView,

    events: {
        'change input[name=search]': 'search',
        'click .clear': 'clear'
    },

    initialize: function() {
        this.model = new Backbone.Model();
        this.bindTo(this.model, 'change', this.render, this);
    },
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    },

    addItemView: function(item, ItemView) {
        if (this.filter(item)) {
            return Backbone.Marionette.CompositeView.prototype.addItemView.apply(this, arguments);
        }
    },

    filter: function(movie) {
        var strip = function(str) {
            return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
        };

        var term = this.model.get('term');
        var label = movie.get('label');

        if (term) {
            term = strip(term).toLowerCase();
            label = strip(label).toLowerCase();

            return label.match(new RegExp(term));
        }

        return true;
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