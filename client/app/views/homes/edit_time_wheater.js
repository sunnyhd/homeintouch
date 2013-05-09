var EditStyleWidgetForm = require('views/homes/abstract_edit_widget');

module.exports = EditStyleWidgetForm.extend({

    template: "#edit-time-weather-settings-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    initialize: function() {
        this.homeModel = this.model.collection.parentHome;
    },

    serializeData: function(){
        var data = EditStyleWidgetForm.prototype.serializeData.apply(this);

        data.timeWheaterFields = this.homeModel.get("timeWheaterFields");
        data.timeWheaterConfiguration = this.homeModel.get("timeWheaterConfiguration").toJSON();

        return data;
    },

    onRender: function() {
        var $autocompleteEl = $('#locationLabel', this.$el);
        $autocompleteEl.autocomplete({
            minLength: 2,
            source: '/api/cities',
            focus: function( e, ui ) {
                if (ui.item) {
                    $("#locationLabel").val( ui.item.label );
                }
                return false;
            },
            select: function( e, ui ) {
                if (ui.item) {
                    $("#locationLabel").val( ui.item.label );
                    $("#location").val( ui.item.value );
                }
                return false;
            }
        });

        $autocompleteEl.data("autocomplete")._renderItem = function(ul, item) {
            return $( "<li>" )
                .data( "item.autocomplete", item )
                .append( "<a>" + item.label + "</a>" )
                .appendTo( ul );
        };

        $autocompleteEl.data("autocomplete")._renderMenu = function(ul, items) {
            var self = this;
            var subItems = _.first(items, 15);
            $.each(subItems, function(index, item) {
                self._renderItem(ul, item);
            });
            
            $("<li class='ui-menu-item'></li>")
            .append("<span class='ui-autocomplete-result-item'>Showing <b>" + subItems.length + "</b> of <b>" + items.length + "</b> results</span>")
            .appendTo(ul);
        };
    },

    getFormFields: function() {
        var formFields = EditStyleWidgetForm.prototype.getFormFields.apply(this);
        formFields = _.union(formFields, _.pluck(this.model.get("timeWheaterFields"), 'id'));
        formFields.push('location');
        formFields.push('locationLabel');

        return formFields;
    },

    updateModel: function(data) {
        EditStyleWidgetForm.prototype.updateModel.apply(this, [data]);

        this.homeModel.get("timeWheaterConfiguration").set('location', data.location);
        this.homeModel.get("timeWheaterConfiguration").set('locationLabel', data.locationLabel);
    }
});