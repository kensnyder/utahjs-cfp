(function($) {	
	function send(to, data, more) {
		$.ajax($.extend({
			type: 'post',
			url: '/' + to + '.json',
			data: data
		}, more || {}));
	}
	$(function() {
		$('.paper').each(function() {
			var $paper = $(this);
			var id = $paper.attr('data-id');			
			$paper.find('.upvote').click(function(evt) {
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
				$control.toggleClass('deleted');
				send('admin-delete', {
					id: id,
					state: newState
				});
			});
			$paper.find('.comment').blur(function() {
				var $input = $(this);
				send('admin-comment', {
					id: id,
					comment: $input.val()
				});
			});
		});
//		$('.more').click();
//		$('.less').click();
	});
})(jQuery);