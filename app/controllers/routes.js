"use strict";

var models = require('../models.js');
var Paper = models.Paper;
var Hit = models.Hit;
var Log = models.Log;

// common stuff
var baseTitle = 'UtahJS Conference - Friday June 6, 2014';

function setup(app) {
	app.use(function(request, response, next) {
		new Hit().save({
			ip: getIpAddress(request),
			method: request.method,
			uri: request.host + request.originalUrl,
			created: new Date(),
			xhr: request.xhr
		}, next);
	});
	// default page
	app.get('/', function(request, response) {
		Paper.count(function(err, count) {
			response.render('index', {
				title: baseTitle,
				numPapers: count
			});
		});
	});
	// submit form
	app.get('/submit', function(request, response) {
		response.render('submit', {
			title: 'Submit Presentation Proposal :: ' + baseTitle,
			paper: {}
		});
	});
	// data submitted
	app.post('/submit', function(request, response) {
		var paper = new Paper(request.body.paper);
		console.log('[BACKUP] paper submitted: ' + paper.data);
		if (!paper.isValid()) {
			// required field missing		
			response.render('submit', {
				title: 'Submit Presentation Proposal :: ' + baseTitle,
				error: 'Please complete all required fields.',
				paper: paper
			});
			return;
		}
		paper.save(function() {			
			response.render('success', {
				title: 'Thank you for your submission :: ' + baseTitle
			});
		});
	});
	// voting page
	app.get('/vote', function(request, response) {
		Paper.findAll(function(err, papers) {
			response.render('papers', {
				title: 'Which papers do you like? :: ' + baseTitle,
		   		papers: papers,
				admin: false
			});
		});
	});
	// ajax request to tally vote
	app.post('/tally.json', function(request, response) {
		var id = request.param('id');
		var score = request.param('score') === '-1' ? -1 : 1;
		var uid = request.param('uid');
		var data = {
			id: id,
			vote: {
				date: new Date(),
				ip: getIpAddress(request),
				score: score,
				uid: uid
			}
		};
		Papers.addVote(data, function(err) {
			response.json({
				success: !!err
			});
		});
	});
	// list of papers in admin mode
	app.get('/papers-admin', function(request, response) {
		response.render('papers', {
			title: 'Papers Admin :: ' + baseTitle,
	   		papers: papers,
			admin: true
		});
	});
	// favorite or unfavorite from admin page
	app.post('/admin-faviorite.json', function(request, response) {
		var id = request.param('id');
		var onoff = request.param('onoff') === '1';
		for (var i = 0, len = papers.length; i < len; i++) {
			if (papers[i].id == id) {
				papers[i].admin_favorite = onoff;
				response.json({
					success: true
				});
				savePaper(paper);
				return;
			}
		}
		// paper with id not found
		response.json({
			success: false
		});
	});
	// delete or undelete a paper from admin page
	app.post('/admin-delete.json', function(request, response) {
		var id = request.param('id');
		var newState = request.param('state') === '0';
		for (var i = 0, len = papers.length; i < len; i++) {
			if (papers[i].id == id) {
				papers[i].deleted = newState;
				response.json({
					success: true
				});
				savePaper(paper);
				return;
			}
		}
		// paper with id not found
		response.json({
			success: false
		});
	});
	// add or update a comment on a paper from the admin page
	app.post('/admin-comment.json', function(request, response) {
		var id = request.param('id');
		var comment = request.param('comment');
		for (var i = 0, len = papers.length; i < len; i++) {
			if (papers[i].id == id) {
				papers[i].admin_comment = comment;
				response.json({
					success: true
				});
				savePaper(paper);
				return;
			}
		}
		// paper with id not found
		response.json({
			success: false
		});
	});
};




// --- helper functions --- //
// get ip addresses
function getIpAddress(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// // read our data on server start
// function loadPapersData() {
// 	var papers = [];

// 	if (0 && process.env.PORT) {
// 		mongo = require('mongodb');

// 		mongoUri = process.env.MONGOLAB_URI ||
// 		  process.env.MONGOHQ_URL ||
// 		  'mongodb://localhost/mydb';

// 		mongo.Db.connect(mongoUri, function (err, db) {
// 			console.log('[DEBUG] connected to mongo at `' + mongoUri + '` with ' + (err ? 'error `' + err + '`' : 'no error'));
// 		  db.collection('papers', function(er, collection) {
// 			console.log('[DEBUG] opened collection `papers` with ' + (er ? 'error `' + er + '`' : 'no error'));
// 		  	papersCollection = collection;	    
// 		  });
// 		});
// 	}
// 	if (papersCollection) {
// 		papersCollection.find().toArray(function(err, items) {
// 			console.log('[DEBUG] loaded ' + (items ? items.length : 0) + ' papers from mongo with ' + (err ? 'error `' + err + '`' : 'no error'));
// 			papers = items || [];
// 		});
// 	}
// 	else {
// 		try {
// 			var contents = fs.readFileSync(__dirname + '/data/papers.json');
// 			papers = JSON.parse(contents || "[]");
// 		} catch (e) {
// 			console.log('[ERROR] could not write to papers.json');
// 		}
// 	}
// 	return papers;
// }
// // write our data when anything changes
// function savePaper(paper) {	
// 	if (papersCollection) {
// 		papersCollection.insert(paper, {safe: true}, function(er, rs) {
// 			console.log('[DEBUG] inserted paper with ' + (er ? 'error `' + er + '`' : 'no error'));
// 		});
// 	}
// 	try {
// 		var contents = JSON.stringify(papers || []);
// 		return fs.writeFileSync(__dirname + '/data/papers.json', contents);
// 	}
// 	catch (e) {
// 		return false;
// 	}
// }
// // find the max paper id on server start
// function getMaxPaperId() {
// 	var max = 0;
// 	papers.forEach(function(paper) {
// 		if (paper.id > max) {
// 			max = paper.id;
// 		}
// 	});
// 	return max;
// }
// function processPaper(paper) {
// 	if (!paper) {
// 		return false;
// 	}
// 	'name email bio title description'.split(' ').forEach(function(field) {
// 		paper[field] = paper[field] ? paper[field].trim() : '';
// 	});
// }
// function isPaperValid(paper) {
// //	return paper && 'name email bio title description'.split(' ').all(function(f) { return !!f; });
	
// }

module.exports = {
	setup: setup
};