var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_cover_item'),

    events: {
        'click .pictureContainer': 'show'
    },

    show: function() {
    	if (this.model.get('filetype') === 'directory') {
        	app.router.navigate('#pictures/cover-view/' + this.model.get('file'), {trigger: true});
    	} else {
            app.router.navigate('#pictures/cover-view/file/' + this.model.get('file'), {trigger: true});
    	}
    }
    
});