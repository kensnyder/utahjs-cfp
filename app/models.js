"use strict";

var dsn = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localcfp2';
var collections = ["papers", "hits", "logs"];
var mongojs = require('mongojs');
var db = mongojs.connect(dsn, collections);		  
var ObjectID = mongojs.ObjectId;

function Paper(data) {
	if (data) {		
		'name email bio title description'.split(' ').forEach(function(field) {
			data[field] = data[field] ? data[field].trim() : '';
		});
		this.data = data;
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
			db.papers.update({_id:this.data._id}, this.data, onComplete);
		}
		else {
			this.data._id = new ObjectID();
			this.data.created = new Date();
			this.data.admin_favorite = false;
			this.data.deleted = null;
			this.data.admin_comment = '';
			this.data.score = 0;
			this.data.votes = [];
			db.papers.save(this.data, onComplete);
		}
	}
};
Paper.count = function(onComplete) {
	db.papers.runCommand('count', onComplete);
};
Paper.findAll = function(onComplete) {
	db.papers.find(onComplete);
};
Paper.addVote = function(data, onComplete) {
	db.papers.update({_id: data.id}, {
		$inc: {score: data.vote.score},
		$push: {votes: data.vote}
	}, onComplete);
};

function Hit() {}
Hit.prototype = {
	save: function(hit, onComplete) {
		db.hits.save(hit, onComplete);
	}
};

function Log() {}
Log.prototype = {
	write: function(code, msg, onComplete) {
		db.logs.save({
			code: code,
			msg: msg,
			created: new Date()
		}, onComplete);
	}
}

module.exports = {
	Paper: Paper,
	Hit: Hit,
	Log: Log
};