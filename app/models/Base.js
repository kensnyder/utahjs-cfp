"use strict";

var nada = {};

var BaseModel = function(data) {
	if (data instanceof BaseModel) {
		this.data = data.data;
	}		
	else if (data instanceof ObjectId) {		
		this.data = { _id: data };
	}
	else if (typeof data == 'object') {
		this.data = data;
	}
	else if (data) {
		this.data = { _id: new ObjectId(data) };
	}
	else {
		this.data = {};
	}
	this.initialize();
};

BaseModel.prototype = {
	initialize: function() {},
	getCollection: function() {
		if (!this._collectionConstructor) {
			this._collectionConstructor = '';





			
		}
		return this._collectionConstructor;
	},

};

var BaseCollection = function(items) {
	this.setItems(Array.isArray(items) ? items : []);
	this.initialize();
};

BaseCollection.prototype = {
	modelConstructor: BaseModel,
	initialize: function() {},
	setItems: function(items) {
		this.items = items.map(function(item) {
			if (item instanceof BaseModel) {
				return item;
			}
			return new this.modelConstructor(item);
		});
	},
	toArray: function() {
		return this.items.map(function(item) {
			return item.data;
		});
	},
	find: function() {
		this.db[this.collection].
	}

};

module.exports = {

	BaseModel: BaseModel,

	BaseCollection: BaseCollection,
	
	createModel: function(methods) {
		var ctor = function(db) {
			this.db = db;
		};
		ctor.prototype = new BaseModel(nada);
		for (var name in methods) {
			ctor.prototype[name] = methods[name];
		}
	}

};