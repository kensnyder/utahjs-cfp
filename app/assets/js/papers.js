(function($, localStorage, JSON) {	
	function getUid() {
		var uid = localStorage.getItem('uid');
		if (!uid) {
			uid = Math.floor(Math.random() * 1e8);
			localStorage.setItem('uid', uid);
		}
		return uid;
	}
	function send(to, data, more) {
		if (typeof data == 'object') {
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
			var $score = $voteup.find('.score');
			if (isVotedUp(id)) {
				$voteup.addClass('upvoted');
			}			
			// setup vote up button
			$voteup.click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
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
				$score.text( parseFloat($score.text()) + score );
				send('tally', {
					id: id,
					score: score,
					success: function(result) {
						console.log('tally success!', result);
						if (result && result.newScore) {
							$score.text(result.newScore);
						}
					}
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
				if (!confirm('Are you sure you want to delete this submission?')) {
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
				var $control = $(this);
				var newComment = prompt('Comment:', $commentText.text());
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