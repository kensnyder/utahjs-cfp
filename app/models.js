"use strict";

var dsn = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_app21420041_A:tNDygPwSWhKxUhMUVqlNBsdyPVjkyzqD@ds027419.mongolab.com:27419/heroku_app21420041';
var collections = ["papers2015", "hits2015", "logs2015"];
var mongojs = require('mongojs');
var db = mongojs.connect(dsn, collections);		  
var ObjectId = mongojs.ObjectId;

function Paper(data) {
	if (data instanceof ObjectId) {		
		this.data = { _id: data };
	}
	else if (typeof data == 'object') {		
		'name email bio title description'.split(' ').forEach(function(field) {
			data[field] = data[field] ? data[field].trim() : '';
		});
		this.data = data;
	}
	else if (data) {
		this.data = { _id: new ObjectId(data) };
	}
	else {
		this.data = {};
	}
}
Paper.prototype = {
	isValid: function() {
		var p = this.data;
		return (p && p.name && p.email && p.bio && p.title && p.description);
	},
	save: function(onComplete) {
		if (this.data._id) {
			db.papers2015.update({_id:this.data._id}, this.data, onComplete);
		}
		else {
			this.data._id = new ObjectId();
			this.data.created = new Date();
			this.data.admin_favorite = false;
			this.data.deleted = null;
			this.data.admin_comment = '';
			this.data.score = 0;
			this.data.votes = [];
			db.papers2015.save(this.data, onComplete);
		}
	},
	setDeletedState: function(newState, onComplete) {
		db.papers2015.update({_id:this.data._id}, {
			$set: { deleted: newState ? new Date() : null }
		}, onComplete);
	},
	setComment: function(comment, onComplete) {
		db.papers2015.update({_id:this.data._id}, {
			$set: { admin_comment: comment }
		}, onComplete);	
	},
	setFavoriteState: function(newState, onComplete) {
		db.papers2015.update({_id:this.data._id}, {
			$set: { admin_favorite: !!newState }
		}, onComplete);
	}
};
Paper.count = function(onComplete) {
	db.papers2015.runCommand('count', onComplete);
};
Paper.findAll = function(onComplete) {
	db.papers2015.find(onComplete);
};
Paper.addVote = function(data, onComplete) {
	db.papers2015.update({
		_id: new ObjectId(data.id)
	}, {
		$inc: {score: data.vote.score},
		$push: {votes: data.vote}
	}, 
	onComplete);
};

function Hit() {}
Hit.prototype = {
	save: function(hit, onComplete) {
		db.hits2015.save(hit, onComplete);
	}
};

function Log() {}
Log.prototype = {
	write: function(code, msg, data, onComplete) {
		if (typeof msg == 'function' || arguments.length == 1) {
			db.logs2015.save({
				code: 'LOG',
				msg: code,
				created: new Date()
			}, msg);
		}
		else if (typeof data == 'function' || arguments.length == 2) {
			db.logs2015.save({
				code: code,
				msg: msg,
				created: new Date()
			}, data);
		}
		else {
			db.logs2015.save({
				code: code,
				msg: msg,
				data: data,
				created: new Date()
			}, onComplete);
		}
	}
}

module.exports = {
	Paper: Paper,
	Hit: Hit,
	Log: Log
};