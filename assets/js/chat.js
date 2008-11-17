(function($) {  
  var field = $('#message'), messages = $('#messages'), scroll_to_bottom = true,
      message_url = '/rooms/' + room_id + '/messages';
  
  function createMessage(body, o) {
    var params = {breed:'text', body:body, evil:evil}
    $.extend(params, o || {})
    $.post(message_url, params, function(json) {
      receivePing(json);
      field.val('').focus().scrollTo();
    }, 'json');
  }
  
  function addMessageToList(message) {
    if ($('#message_' + message.evil).length == 0) {      
      messages.append('<div id="message_' + message.evil +'" class="message">' + 
        '<div class="message_user">' + message.user.nickname + '</div>' +
        '<div class="message_body"></div>' +
      '</div>');
      // escapes the html of the message and appends it
      $('#message_' + message.evil + ' div.message_body').append(document.createTextNode(message.body));      
      field.scrollTo();
    } else {
      l('message already existed');
    }
  }
  
  function updateUsersOnline(users) {
    // nickname email
    html = '<ul>';
    $.map(users, function(u) {
      html += '<li>' + u.nickname + '</li>';
    });
    html += '</ul>';
    $("#online_users").html(html);
  }
  
  function receivePing(json) {
    var messages = json['messages'],
        users = json['users'];
        
    $.map(messages, function(m) { addMessageToList(m); });
    updateUsersOnline(users);
    num = messages.length;
    if (num > 0) {
      var m = messages[num-1];
      evil = m.evil;
      l('setting evil to: ' + evil);
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
  $.timer(3000, function(timer) {
    $.get(message_url, {'evil':evil}, receivePing, 'json');
    
    times += 1;
    // if (times == 20) { timer.stop(); }
  });
  
  $(window).bind('resize', function() { 
    field.scrollTo();
  });  
})(jQuery);