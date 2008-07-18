(function($) {	
	$.hotkeys({
		'h': function() { window.location = '/'; }
	});
	
	$(document).ready(function() {
		$('input[type=text]').addClass('text');
		$('input[type=submit]').addClass('submit');
		$('textarea.expanding').growfield({animate:false});
	});
	
	function parseId(el) {
		var parts = $(el).attr('id').split('_');
		var id = parts[parts.length-1];
		return id;
	}
})(jQuery);

jQuery.fn.scrollTo = function() {
  window.scrollTo(0, $(this).offset().top);
  return this;
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