var Promise = require('../promise');
var xbmc = require('../xbmc');
var Class = require('simple-class').Class;

/**
 * Converts an error to string in order to log
 */
function errorToString(err) {
	if (typeof err === 'object') {
		var result = JSON.stringify(err);
		if(result === '{}') return err;

		return result;
	} else {
		return err;
	}
}

/**
 * If a filter is passed, it's represented by a string, in order to use it on the log
 */
function filterToString(filter) {
	if(filter) return '(filter "' + JSON.stringify(filter) + '")';

	return '';
}


/**
 * Importer class definition
 */
module.exports = Class.extend({
	init: function(config) {
		this.config = config;
	},

	/**
 	 * Represents the item as a string, useful for logging
 	 */
	itemToString: function(item) {
		if(item.label) {
			return this.itemLabel() + ' "' + item.label + '" (id: ' + this.id(item) + ')';
		} else {
			return this.idToString(this.id(item));
		}
	},

	/**
 	 * Represents the item id as a string, useful for logging
 	 */
	idToString: function (id) {
		return this.itemLabel() + ' (id: ' + id + ')';
	},

	/**
 	 * Retrieves the ID from the item, using the field name specified in the configuration
 	 */
	id: function (item) {
		return item[this.config.idField];
	},

	/**
 	 * Returns the generic name of the represented item (movie, song, album, etc)
 	 */
	itemLabel: function() {
		return this.config.name;
	},

	/**
 	 * Returns the generic name of the represented item as plural (movies, songs, albums, etc)
 	 */
	itemsLabel: function() {
		return this.itemLabel() + 's';
	},

	/**
 	 * Imports the items from the media center according to the configuration.
 	 * This is the entry point for the importing process
 	 */
	import: function(filter) {
		var start = Date.now();
		var self = this;

		// Load the item list using the filter
		return this.loadItemList(filter)
		.then(function(items) {
			// Process all the items
			console.log('Found ' + items.length + ' ' + self.itemsLabel() + ' ' + filterToString(filter))
			return self.processAll(items, filter);
		}).then(function() {
			// Notify by log that the process finished
			var end = Date.now();
		    console.log('FINISHED IMPORTING the ' + self.itemsLabel() + ' ' + filterToString(filter) + ' in ' + (end-start)/1000 + ' seconds');
		}).fail(function(err) {
			// Error occurred while procesing, log and throw it up
			err = 'Problem while importing the ' + self.itemsLabel() + ': ' + errorToString(err);
			console.log(err);
			throw err;
		});
	},

	/**
 	 * Process all the items (retrieve details and updates the db).
 	 * Returns a promises that will be fulfilled only when ALL the items have been processed
 	 */
	processAll: function(items, filter) {
		var finished = 0;
		var total = items.length;
		var self = this;
		// Get an array of promises, one for each item
		var promises = items.map(function(i) {
			// Process the item
			return self.processItem(i)
				.then(function(item) {
					// Notify the item has been processed and update the % done
					finished++;
					console.log(Math.round(finished/total*100) + '% of the ' + self.itemsLabel() + ' ' + filterToString(filter) + ' IMPORTED -> ' + self.itemToString(item));
					return item;
				}).fail(function(err) {
					throw 'Problem while importing ' + self.itemToString(i) + ': ' + errorToString(err);
				});
		});

		// The promise returned by this method will be resolved when ALL the items (and its children) have been processed
		return Promise.all(promises);
	},

	/**
 	 * Process a single item (retrieve details and updates the db).
 	 */
	processItem: function(i) {
		console.log('Retreiving ' + this.itemLabel() + ' details for ' + this.itemToString(i));
		var self = this;
		// Load the details
		return this.loadItemDetails(i)
		.then(function(item) {
			// Delete old outdated entry from DB
			return self.removeItem(self.id(item))
				.then(function() {
					// Persist new entry
					return self.persistItem(item);
				})
				.then(function() {
					// When the item has been processed, import its children if available (Artist->Album->Song)
					return self.processChildren(item);
				})
				.then(function() {
					return item;
				});	
		});
	},

	/**
 	 * If a subimporter is configured, process the children of the current item before moving on to the next
 	 */
	processChildren: function(item) {
		if(this.config.subImporter) {
			// Call the subimporter "import" method with the appropriate filter
			console.log('Importing ' + this.config.subImporter.itemsLabel() + ' for ' + this.itemToString(item));
			return this.config.subImporter.import(this.buildFilterForChildren(item));	
		
		} else {
			// If no subimporter is defined, returned immediately with the item
			return Promise.asPromise(item);	
		}
	},

	/**
 	 * Builds the filter object for the subimporter.
 	 * By default, it adds the current item's id to the object (eg: for artist: {artistid: id})
 	 */
	buildFilterForChildren: function(item) {
		var filter = {};
		filter[this.config.idField] = this.id(item);
		return filter;
	},

	/**
 	 * Removes an item by id from the DB
 	 */
	removeItem: function(id) {
		console.log('Removing from DB ' + this.idToString(id));
				
		var promise = Promise.withCallback();
		// Remove existing cached item
		var params = {};
		params[this.config.idField] = id;
		// Call Mongoose
		this.config.Model.remove(params, promise.cb);

		var self = this;
	    return promise.fail(function(err) {
			throw 'Problem while removing ' + self.idToString(id) + ' details: ' + errorToString(err);
		});
	},

	/**
 	 * Persist the item to the DB
 	 */
	persistItem: function(item) {
		console.log('Persisting to DB ' + this.itemToString(item));
		// Save item in cache
		var promise = Promise.withCallback();
	    var instance = new this.config.Model(item);

	    // Call Mongoose
	    instance.save(promise.cb);

	    var self = this;
	    return promise.fail(function(err) {
			throw 'Problem while persisting ' + self.itemToString(item) + ': ' + errorToString(err);
		});
	},

	/**
 	 * Retrieves the item details from the Media center using its id and the configuration.
 	 */
	loadItemDetails: function(item) {
		var id = this.id(item);
		var promise = Promise.withCallback();

		// Define the params
		var params = {} 
		if(this.config.item.properties) params.properties = this.config.item.properties;
		params[this.config.idField] = id;

		// Call the Media center
		xbmc.rpc(this.config.item.method, params, promise.cb);

		var self = this;
		return promise.then(function(res) {
			// Only return the attribute defined in the configuration from the response
			return res[self.config.item.responseField];
		}).fail(function(err) {
			throw 'Problem while loading ' + self.idToString(id) + ': ' + errorToString(err);
		});
	},

	/**
 	 * Loads the list of items from the media center.
 	 * If passed, it applies the filter to the query 
 	 */
	loadItemList: function(filter) {
		var params = {} 
		if(this.config.list.properties) params.properties = this.config.list.properties;
		var log = 'Retreiving ' + this.itemLabel() + ' list';
		
		// Include the filter if available
		if(filter) {
			log += ' using ' + filterToString(filter);
			params = this.addFilterParameters(params, filter);
		} 
		console.log(log);
		
		var promise = Promise.withCallback();

		// Call the media center
		xbmc.rpc(this.config.list.method, params, promise.cb);

		var self = this;
		return promise.then(function(res) {
			// Only return the attribute defined in the configuration from the response
			return res[self.config.list.responseField];
		}).fail(function(err) {
			throw 'Problem while loading list of ' + self.itemsLabel() + ': ' + errorToString(err);
		});
	},

	/**
 	 * Adds the filter to the query parameters
 	 * By default, it adds the filters to a "filter" attribute in the parameters 
	 * (eg. { params: {filter: {artistid: id}} })
 	 */
	addFilterParameters: function(params, filter) {
		params.filter = filter;
		return params;
	}
});