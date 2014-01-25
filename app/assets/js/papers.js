(function($, localStorage) {	
	function send(to, data, more) {
		$.ajax($.extend({
			type: 'post',
			url: '/' + to + '.json',
			data: data
		}, more || {}));
	}
	var votes = JSON.parse(localStorage.getItem('cfp-votes') || "{}");
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
			var $paper = $(this);
			var id = $paper.attr('data-id');
			var $excerpt = $paper.find('.description .excerpt');			
			var $fulldesc = $paper.find('.description .fulldesc');			
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
			var $voteup = $paper.find('.voteup');
			if (isVotedUp(id)) {
				$voteup.addClass('upvoted');
			}			
			$voteup.click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
				var score = $control.hasClass('upvoted') ? '-1' : '1';
				$control.toggleClass('upvoted');
				send('tally', {
					id: id,
					score: score
				});
			});
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
			$paper.find('.delete').click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
				var newState = $control.hasClass('deleted') ? '0' : '1';
				$paper.addClass('deleted');
				send('admin-delete', {
					id: id,
					state: newState
				});
			});
			$paper.find('.comment').click(function(evt) {
				evt.preventDefault();
				var $control = $(this);
				var newComment = prompt('Comment:', $control.text());
				if (newComment === null) {
					// cancelled
					return;
				}
				$control.text(newComment);
				send('admin-comment', {
					id: id,
					comment: newComment
				});
			});
		});
//		$('.more').click();
//		$('.less').click();
	});
})(jQuery, window.localStorage || {
	getItem: jQuery.noop,
	setItem: jQuery.noop
});