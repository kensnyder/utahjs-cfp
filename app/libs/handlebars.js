"use strict";

function setup(hbs) {
	var helpers = {
		date: function(d) {
			if (!(d instanceof Date)) {
				return '';
			}
			return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
		},
		ternary: function(value, valueIfTrue, valueIfFalse) {
			return !!value ? valueIfTrue || '' : valueIfFalse || '';
		},
		truncate: function(value, maxLength) {
			if (value.length <= maxLength) {
				return value;
			}
			return value.slice(0, maxLength) + '...';
		},
		nl2br: function(text) {
			text = hbs.Utils.escapeExpression(text);
			text = text.replace(/[\r\n]{3,}/gm, '\n\n');
		    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
		    return new hbs.SafeString(text);
		},
		contains: function(array, value) {
			return array.indexOf(value) > -1;
		},
		join: function(array, glue) {
			return array.join(glue);
		},
		checkboxes: function(name, options, selected) {
			selected = selected || [];
			var map;
			if (Array.isArray(options)) {
				map = {};
				options.forEach(function(option) {
					map[option] = option;
				});
			}
			else {
				map = options || {};
			}
			var out = '';
			Object.keys(map).forEach(function(key) {
				out += '<label><input type=checkbox';
				out += ' name="' + hbs.Utils.escapeExpression(name) + '"';
				out += ' value="' + hbs.Utils.escapeExpression(key) + '"';
				out += selected.indexOf(key) > -1 ? ' checked' : '';
				out += '> ' + hbs.Utils.escapeExpression(map[key]) + '</label>\n';
			});
			return new hbs.SafeString(out);
		},
		socialLink: function(username, template, prefix) {
			username = username.replace(/^@/, '').replace(/^http.+\//, '');
			var text = hbs.Utils.escapeExpression(prefix + username);
			var href = hbs.Utils.escapeExpression(template.replace('%s', username));
			var html = '<a class=social-link target=_blank href="' + href + '">' + text + '</a>';
			return new hbs.SafeString(html);
		},
		twitter: function(username) {
			return helpers.socialLink(username, 'http://twitter.com/%s', '@');
		},
		github: function(username) {
			return helpers.socialLink(username, 'https://github.com/%s', '');
		}
	};
	Object.keys(helpers).forEach(function(key) {
		hbs.registerHelper(key, helpers[key]);
	});
}

module.exports = {
	setup: setup
};