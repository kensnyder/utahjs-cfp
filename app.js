var express = require('express');
var app = express();
var hbs = require('hbs');
var fs = require('fs');
// decode post values
app.use(express.bodyParser());

// initialize data
var papers = readPapersJson() || [];
var nextId = getMaxPaperId() + 1;

// use handlebars as templating engine
app.set('view engine', 'html');
app.engine('html', hbs.__express);
// serve static files
app.use('/assets', express.static(__dirname + '/assets'));
// setup partials in hbs
hbs.registerPartials(__dirname + '/views/partials');

// common stuff
var baseTitle = 'UtahJS Conference - Friday June 6, 2014';

// default page
app.get('/', function(request, response) {
	response.render('index', {
		title: baseTitle,
		numPapers: papers.length > 5 ? papers.length : 0
	});
});
// submit form
app.get('/submit', function(request, response) {
	response.render('submit', {
		title: 'Submit a Paper :: ' + baseTitle,
		paper: {}
	});
});
// data submitted
app.post('/submit', function(request, response) {
	var paper = request.body.paper;
	console.log(paper);
	processPaper(paper);	
	if (!isPaperValid(paper)) {
		// required field missing		
		response.render('submit', {
			title: 'Submit a Paper :: ' + baseTitle,
			error: 'Please complete all required fields.',
			paper: paper
		});
		return;
	}
	papers.push(paper);
	writePapersJson();
	response.render('success', {
		title: 'Thank you for your submission :: ' + baseTitle
	});
});
// voting page
app.get('/vote', function(request, response) {
	response.render('papers', {
		title: 'Which papers do you like? :: ' + baseTitle,
   		papers: papers,
		admin: false
	});
});
// ajax request to tally vote
app.post('/tally.json', function(request, response) {
	var id = request.param('id');
	var score = request.param('score') === '-1' ? -1 : 1;
	for (var i = 0, len = papers.length; i < len; i++) {
		if (papers[i].id == id) {
			papers[i].votes.count += score;
			papers[i].votes.list.push({
				ip: getIpAddress(request),
				timestamp: +new Date,
				score: score
			});
			response.json({
				success: true,
				votes: papers[i].votes.count
			});
			writePapersJson();
			return;
		}
	}
	// paper with id not found
	response.json({
		success: false
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
			writePapersJson();
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
			writePapersJson();
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
			writePapersJson();
			return;
		}
	}
	// paper with id not found
	response.json({
		success: false
	});
});

// start server
app.listen(3001);
console.log('listening on 3001');

// get ip addresses
function getIpAddress(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}
// read our data on server start
function readPapersJson() {
	var contents = fs.readFileSync(__dirname + '/data/papers.json').toString();
	return JSON.parse(contents || "[]");
}
// write our data when anything changes
function writePapersJson() {
	var contents = JSON.stringify(papers || []);
	return fs.writeFileSync(__dirname + '/data/papers.json', contents);
}
// find the max paper id on server start
function getMaxPaperId() {
	var max = 0;
	papers.forEach(function(paper) {
		if (paper.id > max) {
			max = paper.id;
		}
	});
	return max;
}
function processPaper(paper) {
	if (!paper) {
		return false;
	}
	'name email bio title description'.split(' ').forEach(function(field) {
		paper[field] = paper[field] ? paper[field].trim() : '';
	});
	paper.id = nextId++;
	paper.timestamp = +new Date;
	paper.admin_favorite = false;
	paper.deleted = false;
	paper.admin_comment = '';
	paper.votes = {
		count: 0,
		list: []
	};
}
function isPaperValid(paper) {
//	return paper && 'name email bio title description'.split(' ').all(function(f) { return !!f; });
	return (paper && paper.name && paper.email && paper.bio && paper.title && paper.description);
}