(function($, localStorage, JSON) {
  'use strict';

	function getUid() {
		var uid = localStorage.getItem('uid');
		if (!uid) {
			uid = Math.floor(Math.random() * 1e8);
			localStorage.setItem('uid', uid);
		}
		return uid;
	}
	function send(to, data, more) {
		if (typeof data === 'object') {
			data.uid = getUid();
		}
		return $.ajax($.extend({
			type: 'post',
			url: '/' + to + '.json',
			data: data
		}, more || {}));
	}
	var votes = JSON.parse(localStorage.getItem('cfp-votes')) || {};
	function saveVotes() {
		localStorage.setItem('cfp-votes', JSON.stringify(votes));
	}
	function markAsVoted(id) {
		votes[id] = 1;
		saveVotes();
	}
	function unmarkAsVoted(id) {
		votes[id] = 1;
		saveVotes();
	}
	function isVotedUp(id) {
		return !!votes[id];
	}

	$(function() {
    /*jshint validthis: true*/

    function sortByScore() {
      [].slice.call(document.querySelectorAll('tr.js-paper')).sort(function (a, b) {
          a = parseInt((a.querySelector('td:first-of-type .js-score') || {}).innerHTML);
          b = parseInt((b.querySelector('td:first-of-type .js-score') || {}).innerHTML);
          return a > b ? -1 : b > a ? 1 : 0;
      }).forEach(function (node) {
          node.parentNode.appendChild(node);
      });
    }

    function sortByDate() {
      [].slice.call(document.querySelectorAll('tr.js-paper')).sort(function (a, b) {
          a = new Date((a.querySelector('.js-date') || {}).innerHTML).valueOf();
          b = new Date((b.querySelector('.js-date') || {}).innerHTML).valueOf();
          // show newest first
          return a > b ? -1 : b > a ? 1 : 0;
      }).forEach(function (node) {
          node.parentNode.appendChild(node);
      });
    }

    function isFavorited(el) {
      return /favorited/i.test(
        (el.querySelector('.js-favorite') || {}).className
      ) ? 1 : -1;
    }
    function sortByFav() {
      [].slice.call(document.querySelectorAll('tr.js-paper')).sort(function (a, b) {
          a = isFavorited(a);
          b = isFavorited(b);
          return a > b ? -1 : b > a ? 1 : 0;
      }).forEach(function (node) {
          node.parentNode.appendChild(node);
      });
    }

    function updateSort() {
      var val = $(this).val() || 'date';

      if (/date/i.test(val)) {
        sortByDate();
      }
      else if (/pop|score/i.test(val)) {
        sortByScore();
      }
      else if (/fav/i.test(val)) {
        sortByFav();
      }
    }

    $('body').on('change', '.js-sort-by', updateSort);
    sortByDate();

		$('.paper').each(function() {
			// get data and elements
			var $paper = $(this);
			var id = $paper.attr('data-id');
			var $excerpt = $paper.find('.description .excerpt');
			var $fulldesc = $paper.find('.description .fulldesc');
			// setup more/less buttons for description
			$paper.find('.description .more').click(function(evt) {
				evt.preventDefault();
				$excerpt.hide();
				$fulldesc.slideDown(300);
			});
			$paper.find('.description .less').click(function(evt) {
				evt.preventDefault();
				$fulldesc.slideUp(300, function() {
					$excerpt.show();
				});
			});
			// mark as voted up if previously voted up
			var $voteup = $paper.find('.voteup');
			var $score = $voteup.find('.js-score');
			if (isVotedUp(id)) {
				$voteup.addClass('upvoted');
			}
			// setup vote up button
			$voteup.click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
        var score;

				if ($control.hasClass('upvoted')) {
					score = -1;
					$control.removeClass('upvoted');
					unmarkAsVoted(id);
				}
				else {
					score = 1;
					$control.addClass('upvoted');
					markAsVoted(id);
				}
				var newScore = parseFloat($score.text()) + score;
				$score.fadeOut(400, function() {
					$score.text(newScore).fadeIn(400);
				});
				send('tally', {
					id: id,
					score: score
				});
			});
			// mark as favorited
			$paper.find('.favorite').click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
				var onoff = $control.hasClass('favorited') ? '0' : '1';
				$control.toggleClass('favorited');
				send('admin-favorite', {
					id: id,
					onoff: onoff
				});
			});
			// soft delete
			$paper.find('.delete').click(function(evt) {
				evt.preventDefault();
				if (!window.confirm('Are you sure you want to delete this submission?')) {
					return;
				}
				$paper.remove();
				send('admin-delete', {
					id: id,
					state: 0
				});
			});
			// add/edit comment
			var $commentText = $paper.find('.comment-text');
			$paper.find('.comment').click(function(evt) {
				evt.preventDefault();

				var newComment = window.prompt('Comment:', $commentText.text());
				if (newComment === null) {
					// cancelled
					return;
				}
				$commentText.text(newComment);
				send('admin-comment', {
					id: id,
					comment: newComment
				});
			});
		});
	});
})(jQuery, window.localStorage || {
	getItem: jQuery.noop,
	setItem: jQuery.noop
}, window.JSON || {
	stringify: jQuery.noop,
	parse: jQuery.noop
});
