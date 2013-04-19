module.exports = Backbone.Marionette.ItemView.extend({

    className: 'player',

    template: require('templates/players/player'),

    events: {
        'click .stop': 'stopPlayer',
        'click .pause': 'pausePlayer',
        'click .play': 'playPlayer'
    },

    initialize: function() {
        this.bindTo(this.model, 'change:time', this.updateTime, this);
        this.bindTo(this.model, 'destroy', this.close, this);
    },

    updateTime: function() {
        this.$(".playerTime").html(this.model.currentTime());
    },

    stopPlayer: function(e) {
        e.preventDefault();
        this.model.stop();
        this.close();
    },

    pausePlayer: function(e) {
        e.preventDefault();
        var btn = this.$(".toggle");
        btn.addClass( "play" ).removeClass( "pause" );
        btn.html("Play");
        this.model.pause();
    },

    playPlayer: function(e) {
        e.preventDefault();
         var btn = this.$(".toggle");
        btn.addClass( "pause" ).removeClass( "play" );
        btn.html("Pause");
        this.model.play();
    }

});