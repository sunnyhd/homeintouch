var Promise = require('../promise');
var xbmc = require('../xbmc');
var Class = require('simple-class').Class;

var DEFAULT_PAGE_SIZE = 50;

/**
 * Converts an error to string in order to log
 */
function errorToString(err) {
	var result = JSON.stringify(err);
	if(result === '{}') return err;
	return result;
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
		config.list.pageSize = config.list.pageSize || DEFAULT_PAGE_SIZE;
		this.config = config;
		this.processedIds = {};
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


	/********************************************************************************************************************
 	 ** 								BATCH IMPORT (ONE-TIME PROCESS)												   **
 	 ********************************************************************************************************************/

	/**
 	 * Imports the items from the media center according to the configuration.
 	 * This is the entry point for the importing process
 	 */
	import: function(filter) {
		this.processedIds = {};
		var start = Date.now();
		var self = this;

		// Load the item list using the filter
		return this.loadItemList(filter)
		.then(function(items) {
			return self.removeAll(filter)
				.then(function() {
					return items;
				});
		})
		.then(function(items) {
			// Process all the items
			console.log('Found ' + items.length + ' ' + self.itemsLabel() + ' ' + filterToString(filter))
			return self.processAll(items, filter);
		})
		.then(function() {
			// Notify by log that the process finished
			var end = Date.now();
		    console.log('FINISHED IMPORTING the ' + self.itemsLabel() + ' ' + filterToString(filter) + ' in ' + (end-start)/1000 + ' seconds');
		})
		.fail(function(err) {
			// Error occurred while procesing, log and throw it up
			err = 'Problem while importing the ' + self.itemsLabel() + ': ' + errorToString(err);
			console.log(err);
			//throw err;
			return true;
		})
		.fin(function() {
			self.processedIds = {};
		});
	},

	/**
 	 * Loads the list of items from the media center.
 	 * If passed, it applies the filter to the query
 	 */
	loadItemList: function(filter) {
		console.log('Retreiving ' + this.itemLabel() + ' list');
		
		var self = this;
		var items = [];
		return this.loadItemsFromPage(items, filter, 1)
		.then(function() {
			return items;
		})
		.fail(function(err) {
			throw 'Problem while loading list of ' + self.itemsLabel() + ': ' + errorToString(err);
		});
	},

	/**
 	 * Loads all the items from the media center STARTING from the provided page (in order to use pagination).
 	 * eg. if page is 2, it will load from page 2 to the last.
 	 * It calls itself recursively.
 	 */
	loadItemsFromPage: function(items, filter, page) {
		var pageSize = this.config.list.pageSize;

		var start = (page - 1) * pageSize; 
		var end = start + pageSize;

		var params = {};
		if(this.config.properties) params.properties = this.config.properties;

		params.limits = {
			start: start,
			end: end
		};

		var log = 'Retreiving page ' + page + ' (from item ' + start + ' to ' + end + ')';

		// Include the filter if available
		if(filter) {
			log += ' using ' + filterToString(filter);
			params = this.addFilterParameters(params, filter);
		} 
		console.log(log);
		
		var self = this;

		// Call the media center
		return Promise.asPromise(xbmc, xbmc.rpc, this.config.list.method, params)
			.then(function(res) {
				var pageItems = res[self.config.list.responseField];
				if(pageItems) {
					items.push.apply(items, pageItems);
				}

				// If the last page was reached, return the resolved promised
				if(res.limits.total <= end) return true;

				// Retrieved the next page
				return self.loadItemsFromPage(items, filter, page + 1);
			});
	},

	/**
 	 * Removes all the items from the DB using the filter.
 	 * If no filter is passed all the items of this type (eg. all movies) are removed.
 	 * This is used before importing, in order to start with a clean DB
 	 */
	removeAll: function(filter) {
		if(filter) {
			console.log('Removing ALL {} using filter {}', this.itemsLabel(), JSON.stringify(filter));
		} else {
			console.log('Removing ALL', this.itemsLabel());
			filter = {};
		}
		
		var self = this;
		return Promise.asPromise(this.config.Model, this.config.Model.remove, filter)
			.fail(function(err) {
				throw 'Problem while removing all ' + self.itemsLabel() + ': ' + errorToString(err);
			});
	},

	/**
 	 * Process all the items (retrieve details and updates the db).
 	 * Returns a promises that will be fulfilled only when ALL the items have been processed
 	 */
	processAll: function(items, filter) {
		if(items.length === 0) return Promise.resolve([]);

		return this.processItemsSequentially(filter, items, 0);
		
		/*var finished = 0;
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
		return Promise.all(promises);*/
		
	},

	/**
 	 * Process all the items (retrieve details and updates the db) in sequence, one by one.
 	 * It calls itself recursively.
 	 */
	processItemsSequentially: function(filter, items, i) {
		var self = this;
		return this.processItem(items[i])
			.then(function(item) {
				// Notify the item has been processed and update the % done
				console.log(Math.round((i+1)/items.length*100) + '% of the ' + self.itemsLabel() + ' ' + filterToString(filter) + ' IMPORTED -> ' + self.itemToString(item));
				return item;
			})
			.then(function(item) {
				if(i >= items.length - 1) return Promise.resolve(true);

				return self.processItemsSequentially(filter, items, i + 1);
			});
	},

	/**
 	 * Process a single item (updates the db).
 	 */
	processItem: function(item) {
		var itemId = this.id(item);

		// if the item was already processed, do nothing
		if(this.processedIds[itemId]) {
			console.log(this.itemToString(item) + " already processed, skipping...");
			return Promise.resolve(item);
		}
		this.processedIds[itemId] = true;
			
		console.log('Processing ' + this.itemLabel() + ': ' + this.itemToString(item));
		var self = this;

		// Delete old outdated entry from DB
		return self.removeItem(item)
		.then(function() {
			return self.persistItem(item)
			.then(function() {
				return item;
			});
		})
		.fail(function(err) {
			console.log(err);
		});

	},

	/**
 	 * Removes an item by id from the DB
 	 */
	removeItem: function(item) {

		var id = this.id(item);
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

	


	/********************************************************************************************************************
 	 ** 								SINGLE ITEM IMPORT (ON NOTIFICATION)										   **
 	 ********************************************************************************************************************/

	/**
 	 * Imports a single item (retrieve details, updates the db and imports its children).
 	 * Used when the media center notifies of a new item added.
 	 */
	importItem: function(i) {
		console.log('Retreiving ' + this.itemLabel() + ' details for ' + this.itemToString(i));
		var self = this;
		
		// Load the details
		return this.loadItemDetails(i)
		.then(function(item) {
			// Delete old outdated entry from DB
			return self.removeItem(item)
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
		})
		.fail(function(err) {
			console.log(err);
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
			return Promise.resolve(item);	
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
 	 * Retrieves the item details from the Media center using its id and the configuration.
 	 */
	loadItemDetails: function(item) {
		var id = this.id(item);
		var promise = Promise.withCallback();

		// Define the params
		var params = {} 
		if(this.config.properties) params.properties = this.config.properties;
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
 	 * Adds the filter to the query parameters
 	 * By default, it adds the filters to a "filter" attribute in the parameters 
	 * (eg. { params: {filter: {artistid: id}} })
 	 */
	addFilterParameters: function(params, filter) {
		params.filter = filter;
		return params;
	}
});