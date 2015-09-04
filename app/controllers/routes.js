"use strict";

var models = require('../models.js');
var Paper = models.Paper;
var Hit = models.Hit;
var Log = models.Log;

// common stuff
var baseTitle = 'UtahJS Conference - Friday September 25, 2015';
var paperDeadline = 'August 13th, 2015';

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
	app.get('/late-submit', function(request, response) {
		response.render('submit', {
			accepting: true,
			title: 'Submit Presentation Proposal :: ' + baseTitle,
			audiences: audiences,
			paper: {},
			close_date: paperDeadline,
			admin: request.query.admin
		});
	});
	// data submitted
	app.post('/late-submit', function(request, response) {
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
			papers.forEach(function(paper) {
				paper.votes = paper.votes.filter(function(vote) {
					return ['37.57.154.74','178.219.88.10','212.115.228.96','97.75.189.62'].indexOf(vote.ip) == -1;
				});
				paper.score = paper.votes.reduce(function(sum, vote) {
					return sum + vote.score;
				}, 0);
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
			papers.forEach(function(paper) {
				paper.votes = paper.votes.filter(function(vote) {
					return ['37.57.154.74','178.219.88.10','212.115.228.96','97.75.189.62'].indexOf(vote.ip) == -1;
				});
				paper.score = paper.votes.reduce(function(sum, vote) {
					return sum + vote.score;
				}, 0);
			});
			response.render('papers', {
				title: 'Papers Admin :: ' + baseTitle,
		   		papers: papers,
				admin: true
			});
		});
	});
	// list of favorited papers
	app.get('/favorites', function(request, response) {
		Paper.findAll(function(err, papers) {
			papers = papers.filter(function(paper) {
				return !!paper.admin_favorite && !paper.deleted;
			});
			papers.forEach(function(paper) {
				paper.votes = (paper.votes || []).filter(function(vote) {
					return vote.ip != '97.75.189.62';
				});
				paper.score = (paper.votes || []).reduce(function(sum, vote) {
					return sum + vote.score;
				}, 0);
			});
			papers = papers.sort(function(a, b) {
				var aBig = (a.admin_comment || '').match(/auditorium/i) ? 0 : 1;
				var bBig = (b.admin_comment || '').match(/auditorium/i) ? 0 : 1;
				if (aBig > bBig) {
					return 1;
				}
				if (aBig < bBig) {
					return -1;
				}
				return a.score > b.score;
			});
			papers.forEach(function(paper, i) {
				paper.idx = i+1;
			});
			response.render('favorites', {
				title: 'Admin Favorites :: ' + baseTitle,
		   		papers: papers,
				admin: true
			});
		});
	});
	// schedule
	app.get('/schedule', function(request, response) {
		Paper.findAll(function(err, papers) {
			var schedule = generateSchedule(papers);
			response.render('schedule', {
				title: 'Schedule :: ' + baseTitle,
				schedule: schedule.schedule,
				papers: schedule.papers
			});
		});
	});	
	app.get('/schedule.json', function(request, response) {
		Paper.findAll(function(err, papers) {
			var schedule = generateSchedule(papers).schedule;
			schedule.forEach(function(slot) {
				['large','medium','small'].forEach(function(size) {
					if (slot[size]) {
						delete slot[size].votes;
						delete slot[size].admin_favorite;
						delete slot[size].admin_comment;
					}
				});
			});
			response.json(schedule);
		});
	});	
	// design our shirts!
	app.get('/shirts', function(request, response) {
		// static page
		response.render('shirts');
	});	
	// schedule coming soon page
//	app.get('/schedule-soon', function(request, response) {
//		// static page
//		response.render('schedule-soon');
//	});	
	// official schedule
	app.get('/schedule-2014', function(request, response) {
		// static page
		response.render('schedule-2014');
	});	
	// sponsorship information
	app.get('/sponsor', function(request, response) {
		// static page
		response.render('sponsor');
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

function generateSchedule(papers) {
	papers.forEach(function(paper) {
		paper.slot = parseFloat((paper.admin_comment || '').replace(/^.+SLOT (\d+).*$/i, '$1')) || 9;
	});
	papers = papers.sort(function(a, b) {		
		return a.slot - b.slot;
	});
	var small = [], medium = [], large = [];
	papers.forEach(function(paper) {
		if (!paper.admin_favorite) { return; }
		paper.isBeginner = paper.audience.indexOf('Beginner Developers') > -1;
		if ((/cancel?led/i ).test(paper.admin_comment)) { paper.canceled = true; }
		if ((/large/i      ).test(paper.admin_comment)) { large.push(paper); }
		if ((/medium/i     ).test(paper.admin_comment)) { medium.push(paper); }
		if ((/small/i      ).test(paper.admin_comment)) { small.push(paper); }
	});
	var schedule = [
		{
			time: '8:30am - 9:00am',
			minutes: 30,
			text: 'Registration'
		},
		{
			time: '9:00am - 9:20am',
			minutes: 15,
			text: 'Welcome'
		},
		{
			time: '9:20am - 9:55am',
			minutes: 40,
			is_keynote: true,
			large: large[0]
		},
		{
			time: '10:00am - 10:35am',
			minutes: 40,
			is_keynote: true,
			large: large[1]
		},
		{
			time: '10:40am - 11:15am',
			minutes: 40,
			is_talk: true,
			large: large[2],
			medium: medium[0],
			small: small[0]
		},
		{
			time: '11:20am - 11:55am',
			minutes: 40,
			is_talk: true,
			large: large[3],
			medium: medium[1],
			small: small[1]
		},
		{
			time: '11:55am - 1:25pm',
			minutes: 90,
			text: 'Lunch'
		},
		{
			time: '1:25pm - 2:00pm',
			minutes: 40,
			is_talk: true,
			large: large[4],
			medium: medium[2],
			small: small[2]
		},		
		{
			time: '2:05pm - 2:40pm',
			minutes: 40,
			is_talk: true,
			large: large[5],
			medium: medium[3],
			small: small[3]
		},
		{
			time: '2:45pm - 3:20pm',
			minutes: 40,
			is_talk: true,
			large: large[6],
			medium: medium[4],
			small: small[4]
		},		
		{
			time: '3:25pm - 4:00pm',
			minutes: 40,
			is_talk: true,
			large: large[7],
			medium: medium[5],
			small: small[5]
		},		
		{
			time: '4:05pm - 4:40pm',
			minutes: 40,
			is_talk: true,
			large: large[8],
			medium: medium[6],
			small: small[6]
		},
		{
			time: '4:45pm - 5:00pm',
			minutes: 15,
			text: 'Giveaway'
		},	
		{
			time: '5:00pm - 6:30pm',
			minutes: 105,
			text: 'Break'
		},	
		{
			time: '6:30pm - 9:30pm',
			minutes: 120,
			text: 'Dinner and After Party'
		}
	];
	return {schedule:schedule, papers:papers};
}

module.exports = {
	setup: setup
};