'use strict';

var express = require('express');
var app = express();
var hbs = require('hbs');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');
// decode post values
app.use(bodyParser());
// use handlebars as templating engine
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');
app.engine('html', hbs.__express);
// serve static files and favicon
app.use('/assets', serveStatic(__dirname + '/app/assets'));
app.use(favicon(__dirname + '/app/assets/img/favicon.ico'));
// setup partials in hbs
hbs.registerPartials(__dirname + '/app/views/partials');

// setup handlebars (e.g. helpers)
require('./app/libs/handlebars').setup(hbs);
// setup routes
require('./app/controllers/routes').setup(app);

// start server on requested port
var port = process.env.PORT || 3001;
app.listen(port, function() {
	console.log("> Listening on http://localhost.conf.utahjs.com:" + port);
});
