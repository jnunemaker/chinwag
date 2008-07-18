(function($) {  
  var field = $('#message'), messages = $('#messages'), scroll_to_bottom = true,
      message_url = '/rooms/' + room_id + '/messages',
      text_msg_tpl = $.template('<div id="message_${id}" class="message">' + 
        '<div class="message_user">${user}</div>' +
        '<div class="message_body">${body}</div>' +
      '</div>');
  
  function createMessage(body, o) {
    var params = {breed:'text', body:body}
    $.extend(params, o || {})
    $.post(message_url, params, function(message) {
      addMessageToList(message);
      field.val('').focus().scrollTo();
    }, 'json');
  }
  
  // TODO: check if message exists before adding it
  function addMessageToList(message) {
    if ($('#message_' + message.id).length == 0) {
      $.log('adding message to list');
      messages.append(text_msg_tpl, {
        id: message.id,
        body: message.body,
        user: message.user.nickname
      });
      // TODO: only scroll to bottom if person is at the bottom
      field.scrollTo();
    } else {
      $.log('message already existed');
    }
  }
  
  function addMessagesToList(json) {
    $.map(json, function(m) { addMessageToList(m); });
    num = json.length;
    if (num > 0) {
      since   = json[num-1].created.epoch;
      $.log('setting since to ' + since);
    }
  }
  
  function onKeyPress(event) {
    switch(event.keyCode) {
      case 13: // enter
  	  case 3: // for safari
  	    if (event.shiftKey) {
  	      return; // allow shift+enter for hard returns
        } else if (event.ctrlKey || event.metaKey) {
          // send paste
        } else {
          var value = $.trim($(this).val());
          if (value != '') {
            createMessage(value);
          }
        }
        event.preventDefault();
    }
  }
  
  field.keypress(onKeyPress).scrollTo().focus();
  
  var times = 0;
  $.timer(4000, function(timer) {
    $.get(message_url, {since:since}, addMessagesToList, 'json');
    
    times += 1;
    if (times == 10) { timer.stop(); }
  });
  
  $(window).bind('resize', function() { field.scrollTo(); })
})(jQuery);