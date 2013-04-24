module.exports = Backbone.Marionette.ItemView.extend({

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile",
        "click a#clear-background" : "clearBackgroundClicked"
    },

    loadFile: function(event){
        var imageFile = event.target.files[0];
        this.previewFile(imageFile);
        
        var that = this;
        var fileName = imageFile.name;

        var reader = new FileReader();
        reader.onload = function (event) {
            that.imageStream = event.target.result;
            that.imageFileName = fileName;
        };

        reader.readAsBinaryString(imageFile);

        this.showClearBackgroundBtn();
    },

    getBackgroundImageUrl: function() {
        var img = this.$('#body-background-image').get()[0];
        var url = '';
        if (img) {
            url = img.getAttribute('value');
        }
        return url;
    },

    previewLoadedImage: function() {
        var url = this.getBackgroundImageUrl();
        if (url !== '') {
            this.previewUrl(url);
            this.showClearBackgroundBtn();
        }
    },

    onRender: function() {
        this.hideClearBackgroundBtn();
        this.previewLoadedImage();
    },

    hideClearBackgroundBtn: function() {
        this.$('#clear-background').hide();
    },

    showClearBackgroundBtn: function() {
        this.$('#clear-background').show();
    },

    clearBackgroundFile: function() {
        var backgroundFileElement = this.$('#body-background-image').get()[0]
        backgroundFileElement.outerHTML = backgroundFileElement.outerHTML;
        this.hideClearBackgroundBtn();
        this.clearStyleModel();
    },

    clearStyleModel: function() {},

    hideBackgroundFileInput: function() {
        this.$('#body-background-image').parents('.control-group').hide();
    },

    showBackgroundFileInput: function() {
        this.$('#body-background-image').parents('.control-group').show();
    },

    previewUrl: function(url, holderSelector) {

        holderSelector || (holderSelector = '#holder');

        var parsedUrl = url;

        if (url.indexOf('url(') === 0) {
            parsedUrl = url.substr((url.lastIndexOf('(') + 1)).replace(')', '');
        }

        this.resetPreviewHolder(holderSelector); 

        var $image = $('<img>');
        $image.attr('src', parsedUrl);
        $image.attr('width', 150);
        this.$(holderSelector).append($image);
    },

    resetPreviewHolder: function(holderSelector) {
        holderSelector || (holderSelector = '#holder');
        this.$(holderSelector).children().remove();
    },

    previewFile: function(file) {
        
        var that = this;
        var previewReader = new FileReader();
        previewReader.onload = function (event) {
            that.previewUrl(event.target.result);
        };

        previewReader.readAsDataURL(file);        
    },

    addStyleValues: function(fields, configuration){
        _.each(fields, function(field) {
            if (configuration != null) {
                field.value = configuration.getStyleAttribute(field.id);
            } else {
                field.value = '';
            }
        });
    },

    extractStyle: function(formData, prefix, selector){

        var styleKeys = _.keys(formData);
        var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(prefix) == 0;
        }, this);

        var styleData = _.pick(formData, styleNames);
        var newStyleData = {};
        _.each(styleData, function(value, key){
            if (value !== null && value !== '') {
                newStyleData[key.substr(prefix.length)] = value;
            }
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    updateStyleConfiguration: function(formData, prefix, selector, attributeName) {

        var configurationAttributes = this.extractStyle(formData, prefix, selector);

        var configuration = this.model.get(attributeName);

        if (configuration == null) {
            configuration = new Configuration();
            this.model.set(attributeName, configuration);
        }

        configuration.resetAttributes();

        configuration.set(configurationAttributes);
    },

    clearBackgroundClicked: function() {
        this.resetPreviewHolder();
        this.imageStream = null;
        this.clearBackgroundFile();
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        }

        this.close();
    }
});