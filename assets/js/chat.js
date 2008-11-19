(function($) {
  $(document).ready(function() {
    var field            = $('#message'),
        message_url      = '/rooms/' + room_id + '/messages',
        ping_url         = '/ping/' + room_id;

    function createMessage(body, o) {
      var params = {breed:'text', body:body, evil:evil}
      $.extend(params, o || {})
      $.post(message_url, params, function(json) {
        receivePing(json);
        field.val('').focus();
        scrollToBottom();
      }, 'json');
    }

    function addMessageToList(message) {
      if ($('#message_' + message.evil).length == 0) {
        $("#chat_table").append('<tr data-person="' + message.user.nickname + '" id="message_' + message.evil + '">' + 
            '<td class="person">' + message.user.nickname + '</td>' + 
            '<td></td>' + 
          '</tr>');

        // escapes the html of the message and appends it
        $('#message_' + message.evil + ' td:nth-child(2)').append(document.createTextNode(message.body));
        scrollToBottom();
      } else {
        l('message already existed');
      }
    }

    function updateUsersOnline(users) {
      // nickname email
      var person = $('#onlines a.active').attr('data-person');
      html = '<ul>';
      html += '<li><a href="#" data-person="' + current_user + '">' + current_user + '</a></li>'
      $.map(users, function(u) {
        if (u.nickname != current_user) {
          html += '<li><a href="#" data-person="' + u.nickname + '">' + u.nickname + '</a></li>';
        }
      });
      html += '</ul>';
      $("#onlines").html(html);
      $('#onlines a[data-person=' + person + ']').addClass('active');
      fixChats();
      highlightChats();
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

    $('#message').keypress(onKeyPress).focus();

    var times = 0;
    $.timer(3000, function(timer) {
      $.get(ping_url, {'evil':evil}, receivePing, 'json');

      times += 1;
      // if (times == 10) { timer.stop(); }
    });

    $(window).bind('resize', function() {
      scrollToBottom();
    });
  });
})(jQuery);