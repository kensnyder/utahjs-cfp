"use strict";

var helpers = {
	date: function(d) {
		if (!(d instanceof Date)) {
			return '';
		}
		return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
	}
};

module.exports = {
	setup: function(hbs) {
		Object.keys(helpers).forEach(function(key) {
			hbs.registerHelper(key, helpers[key]);
		});
	}
};