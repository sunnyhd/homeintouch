
module.exports = Backbone.Marionette.ItemView.extend({

	tpls: {
        'item': '<li><span class="divider">/</span><a href="#" data-redirect="<%= path %>"><%= label %></a></li>',
        'itemActive': '<li class="active"><span class="divider">/</span><%= label %></li>'
    },
    
	events: {
		'click a': 'navigate'
    },

    /**
     * Build the items on the breadcrumb based on a list.
     */
    build: function(list) {

        // list = _.reject(list, function(i) { return $.trim(e.label) == ''; });
        var lastIdx = list.length - 1;

        _.each(list, function(e, idx) {

        	var tpl = (idx != lastIdx) ? 'item' : 'itemActive';

        	li = _.template(this.tpls[tpl], {
                path: e.path,
                label: e.label
            });
            this.$el.append(li);
        }, this);

    },

	/**
     * Navigate to a different folder
     */
    navigate: function(e) {
        var $btn = $(e.currentTarget),
        	path = $btn.data('redirect');

        this.trigger('breadcrumb:navigate', path);
    }
    
});