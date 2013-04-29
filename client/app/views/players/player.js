module.exports = Backbone.Marionette.ItemView.extend({

    className: 'player',

    template: require('templates/players/player'),

    events: {
        'click .stop': 'stopPlayer',
        'click .pause': 'pausePlayer',
        'click .play': 'playPlayer',
        'click .previous': 'goPrevious',
        'click .next': 'goNext'
    },

    initialize: function() {
        this.saveItemId();

        this.bindTo(this.model, 'change:item', this.updateItem, this);
        this.bindTo(this.model, 'change:time', this.updateTime, this);
        this.bindTo(this.model, 'change:speed', this.updateButtons, this);
        this.bindTo(this.model, 'destroy', this.close, this);

        this.playMarkup = '<i class="icon-play icon-white"></i>';
        this.pauseMarkup = '<i class="icon-pause icon-white"></i>';
    },

    /**
     * When the player's item changes, if it's new item, render the whole view again 
     */
    updateItem: function() {
        if(!this.model.isCurrentItem(this.item)) {
            this.saveItemId();
            this.render();
        }
    },

    /**
     * Save the item id to see if it need to be re-rendered when it changes
     */
    saveItemId: function() {
        this.item = {id: this.model.get('item').id, type: this.model.get('item').getType()};
    },

    /**
     * When the player's time changes, update that portion of the view 
     */
    updateTime: function() {
        this.$(".playerTime").html(this.model.currentTime());
    },

    /**
     * When the player's speed changes, update the play/pause buttons 
     */
    updateButtons: function() {
        if(this.model.isPlaying()) {
            this.refreshForPlay();
        } else {
            this.refreshForPause();
        }
    },

    /**
     * When the player stops, remove this view 
     */
    stopPlayer: function(e) {
        e.preventDefault();
        this.model.stop();
        this.close();
    },

    refreshForPause: function() {
        var btn = this.$(".toggle");
        btn.addClass( "play" ).removeClass( "pause" );
        btn.html(this.playMarkup);
    },

    refreshForPlay: function() {
        var btn = this.$(".toggle");
        btn.addClass( "pause" ).removeClass( "play" );
        btn.html(this.pauseMarkup);
    },

    pausePlayer: function(e) {
        e.preventDefault();
        this.refreshForPause();
        this.model.pause();
    },

    playPlayer: function(e) {
        e.preventDefault();
        this.refreshForPlay();
        this.model.play();
    },
    
    goPrevious: function(e) {
        e.preventDefault();
        this.model.previous();
    },
    goNext: function(e) {
        e.preventDefault();
        this.model.next();
    }

});