(function($) {
  $('#add_user').submit(function(event) {
    event.preventDefault();
    
		if ($.trim($('#email').val()) != '') {
		  var url = $(this).attr('action');
		  var params = {email:$('#email').val()}
      var button = $('#invite_button');
      button.disable();
      var orig_text = button.val();
      button.val('Inviting User...');
      
      $.post(url, params, function(json) {
				  $('#user_add_message').html(json.user.nickname + ' was added to this room.');
				  button.enable();
				  button.val(orig_text);
        }, 'json');
    } else {
      $('#user_add_message').html('Please enter an email address.');
    }
  });
})(jQuery);