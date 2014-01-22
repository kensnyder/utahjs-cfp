"use strict";

var nada = {};

var BaseModel = function() {};

BaseModel.prototype = {

};

var BaseCollection= function() {};

BaseCollection.prototype = {

};

module.exports = {

	BaseModel: BaseModel,

	BaseCollection: BaseCollection,
	
	createModel: function() {
		var ctor = function(db) {
			this.db = db;
		};
		ctor.prototype = new BaseModel();
	},

	createCollection: function() {
		var ctor = function(db) {
			this.db = db;
		};
		ctor.prototype = new BaseCollection();
	}

};