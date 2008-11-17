(function($) {
	$(document).ready(function() {
		$('input[type=text]').addClass('text');
		$('input[type=submit]').addClass('submit');
	});
	
	function parseId(el) {
		var parts = $(el).attr('id').split('_');
		var id = parts[parts.length-1];
		return id;
	}
})(jQuery);

jQuery.fn.disable = function() {
  return this.each(function() {
    $(this).attr("disabled", true);
  });
}

jQuery.fn.enable = function() {
  return this.each(function() {
    $(this).removeAttr("disabled");
  });
}

/* Client-side access to querystring name=value pairs
	Version 1.3
	28 May 2008
	
	License (Simplified BSD):
	http://adamv.com/dev/javascript/qslicense.txt
*/
function Querystring(qs) { // optionally pass a querystring to parse
	this.params = {};
	
	if (qs == null) qs = location.search.substring(1, location.search.length);
	if (qs.length == 0) return;

// Turn <plus> back to <space>
// See: http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
	qs = qs.replace(/\+/g, ' ');
	var args = qs.split('&'); // parse out name/value pairs separated via &
	
// split out each name=value pair
	for (var i = 0; i < args.length; i++) {
		var pair = args[i].split('=');
		var name = decodeURIComponent(pair[0]);
		
		var value = (pair.length==2)
			? decodeURIComponent(pair[1])
			: name;
		
		this.params[name] = value;
	}
}

Querystring.prototype.get = function(key, default_) {
	var value = this.params[key];
	return (value != null) ? value : default_;
}

Querystring.prototype.contains = function(key) {
	var value = this.params[key];
	return (value != null);
}

$(document).ready(function() {
	fixChats();
	
	$('#toggle_users').click(function() {
		$('#onlines').toggleClass('active');
		$('#toggle_users').toggleClass('active');
		fixChats();
		return false;
	});
	
	$("#onlines").click(function(e) {
	  highlightChats($(e.target));
	  return false;
	});
	
	highlightChats($("#onlines a:first"));
	scrollToBottom();
});

function scrollToBottom() {
  $('#chats').attr({scrollTop: $('#chats').attr('scrollHeight')});
}

function fixChats() {
	var c = $('#chats');
	var o = $('#onlines')
	var t = 31;
	if (o.hasClass('active')) t = t + o.height() + 11;
	c.css({top:t+'px'});
}

function highlightChats(el) {
  if (el) {
    $('#onlines a, #chats tr').removeClass('active');
  	t = $(el).addClass('active');
  } else {
  	t = $("#onlines a.active");
  }
	
	$('#chats tr[data-person="' + t.attr('data-person') + '"]').addClass('active');
	return false;
}