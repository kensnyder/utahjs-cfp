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
		}
	};
	Object.keys(helpers).forEach(function(key) {
		hbs.registerHelper(key, helpers[key]);
	});
}

module.exports = {
	setup: setup
};