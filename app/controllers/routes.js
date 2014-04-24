"use strict";

var models = require('../models.js');
var Paper = models.Paper;
var Hit = models.Hit;
var Log = models.Log;

// common stuff
var baseTitle = 'UtahJS Conference - Friday June 6, 2014';
var paperDeadline = 'May 12th, 2014';

var audiences = [
	'Beginner Developers', 
	'Experienced Developers',
	'Quality Assurance Engineers',
	'Other IT Professionals',
	'Business Professionals'
];

function setup(app) {
	// record hits
	app.use(function(request, response, next) {
		if (request.originalUrl.match(/\/assets\//)) {
			// a resource in assets
			next();
			return;
		}
		new Hit().save({
			ip: getIpAddress(request),
			uid: request.param('uid') || request.body.uid,
			method: request.method,
			uri: request.host + request.originalUrl,
			post: request.body,
			created: new Date(),
			xhr: request.xhr
		}, next);
	});
	// default page
	app.get('/', function(request, response) {
		Paper.count(function(err, count) {
			response.render('index', {
				title: baseTitle,
				numPapers: count,
				close_date: paperDeadline
			});
		});
	});
	// submit form
	app.get('/submit', function(request, response) {
		response.render('submit', {
			title: 'Submit Presentation Proposal :: ' + baseTitle,
			audiences: audiences,
			paper: {},
			close_date: paperDeadline
		});
	});
	// data submitted
	app.post('/submit', function(request, response) {
		var paper = new Paper(request.body.paper);
		new Log().write('BACKUP', 'paper submitted:', paper.data);
		if (!paper.isValid()) {
			// required field missing		
			response.render('submit', {
				title: 'Submit Presentation Proposal :: ' + baseTitle,
				error: 'Please complete all required fields.',
				audiences: audiences,
				paper: paper.data,
				close_date: paperDeadline
			});
			return;
		}
		paper.save(function(err, result) {
			// if (err) {
			// 	response.render('submit-error', {
			// 		title: 'System Error',
			// 		paper: paper.data
			// 	});
			// 	return;
			// }			
			response.render('success', {
				title: 'Thank you for your submission :: ' + baseTitle,
				close_date: paperDeadline
			});
		});
	});
	// voting page
	app.get('/vote', function(request, response) {
		Paper.findAll(function(err, papers) {
			papers = papers.filter(function(paper) {
				return !paper.deleted;
			});
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
		var uid = request.param('uid') || 1;
		var data = {
			id: id,
			vote: {
				date: new Date(),
				ip: getIpAddress(request),
				score: score,
				uid: uid
			}
		};
		console.log('addingVote for ' + id);
		Paper.addVote(data, function(err, result) {
			response.json({
				success: !err && result.n == 1
			});
		});
	});
	// list of papers in admin mode
	app.get('/papers-admin', function(request, response) {
		Paper.findAll(function(err, papers) {
			papers = papers.filter(function(paper) {
				return !paper.deleted;
			});
			response.render('papers', {
				title: 'Papers Admin :: ' + baseTitle,
		   		papers: papers,
				admin: true
			});
		});
	});
	// favorite or unfavorite from admin page
	app.post('/admin-favorite.json', function(request, response) {
		var id = request.param('id');
		var onoff = request.param('onoff') === '1';
		new Paper(id).setFavoriteState(onoff, function(err, result) {			
			response.json({
				success: !err && result && result.n == 1
			});
		});
	});
	// delete or undelete a paper from admin page
	app.post('/admin-delete.json', function(request, response) {
		var id = request.param('id');
		var newState = String(request.param('state')) === '0';
		new Paper(id).setDeletedState(newState, function(err, result) {			
			response.json({
				success: !err && result && result.n == 1
			});
		});
	});
	// add or update a comment on a paper from the admin page
	app.post('/admin-comment.json', function(request, response) {
		var id = request.param('id');
		var comment = request.param('comment');
		new Paper(id).setComment(comment, function(err, result) {			
			response.json({
				success: !err && result && result.n == 1
			});
		});
	});
};

// --- helper functions --- //
// get ip addresses
function getIpAddress(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

module.exports = {
	setup: setup
};