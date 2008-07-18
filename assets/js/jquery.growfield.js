/** jQuery textarea autogrow plugin
 *   jQuery.1.2.6 required
 * 
 * optional parameters: // $(elem).growfield( options ) 
 * * * * * * * * * * * * * * * * * * *
 * auto - bool // default = true // if false, ctrl + up/down are enabled
 * animate - bool // default = true
 * before(jEvent), after(jEvent) - callbacks // 'this' will be the dom object
 * min - integer - height in pixels // default = min-height ? css.min-height || initial height
 * max - integer - height in pixels // maximum size // default = css.max-height || none
 * restore - bool - restore original size on blur (and back to growed on focus) // default = false
 * speed - integer - animation speed. not a jquery parameter // default = 300 (ms)
 * offset - integer - bottom offset // default is calculated for each textarea separately // i don't recommend to touch it :) 
 * 
 * additional functions (public interface):
 * * * * * * * * * * * * * * * * * * *
 * $(..).increase( [step] ), decrease( [step] ), growTo( height ), growToggleAuto( bool ), growToggleRestore( bool ), 
 * growSetMin( integer ), growSetMax( integer )
 * 
 * notes
 * * * * * * * * * * * * * * * * * * *
 * parameters may be set in html attributes // tag attributes have priority 
 * <textarea autogrow=1/0 animate=1/0 speed='' line='' min='' max='' restore='' step=''></textarea>
 * 
 * increase and decrease functions are working only in auto mode
 * 
 * opera:
 * in opera, if you don't have border style for textarea, plugin will set it (opera hides borders in overflow:hidden mode). 
 * in auto mode it won't work at all. More than that, opera returns border:2px solid #00000 even if you don't set it. :(
 * 
 * known problems: 
 * after restore (onfocus) with animation textarea sometimes looses cursor. :( // ff2, ie7xp
 * when reached maximum height, opera will jitter on every keydown :( // opera < 9.5
 * 
 * ctrl + up/down: 
 * in opera and ie this shortcut doesn't work properly. But you may use ctrl + whatever + up/down.
 * 
 * three things that make possible scrollHeight update in opera < 9.5:
 * (actually, we don't need scrollHeight in opera < 9.5, but we need something to be updated when typing)
 * height: auto, toggle overflow to hidden and back to auto, and (!!!) padding >= 4px (am i crazy?!)
 * we need textarea because only in this way we can calculate height with all inherited styles
 * 
 *  @author: johann kuindji (www.kuindji.com, www.stuffedguys.com, www.stuffedtracker.com) jk@kuindji.com
 *  @version 1.1
 *  
 *  example: 
 *  $('textarea').growfield();
 */

(function($){
$.fn.growfield = function( options ) {
    this.each( function() {
        this._growField = true;
        var txt = $(this);        
        if (this.tagName.toLowerCase() != 'textarea') return false;
        if (!options) options = {};
        var th = this;
        this.gf = {
            auto: (typeof(options.auto) != 'undefined' ? options.auto : true),
            animate: (typeof(options.animate) != 'undefined' ? options.animate : true),
            hOffset: (typeof(options.offset) != 'undefined' ? options.offset : 0),
            before: (options.before || null), after: (options.after || null),
            min: (options.min || false),  max: (options.max || false), restore: (options.restore || false), initialH:0,
            busy: false, keysEnabled: false, dummy: null, queue: 0, speed: 300, ms: 15, timeout: false, opera9: false, impossible: false
        };

        this._growInit = function() {
            if (this.gf.before) this._growCallbackBefore = this.gf.before;
            if (this.gf.after) this._growCallbackAfter = this.gf.after;
            this.gf.initialH = txt.get(0).offsetHeight;
            if (typeof(txt.attr('autogrow')) != 'undefined') this.gf.auto = parseInt(txt.attr('autogrow'));
            if (typeof(txt.attr('animate')) != 'undefined') this.gf.animate = parseInt(txt.attr('animate'));
            if (typeof(txt.attr('min')) != 'undefined') this.gf.min = parseInt(txt.attr('min'));
            if (typeof(txt.attr('max')) != 'undefined') this.gf.max = parseInt(txt.attr('max'));
            if (typeof(txt.attr('restore')) != 'undefined') this.gf.restore = parseInt(txt.attr('restore'));
            if (typeof(txt.attr('speed')) != 'undefined') this.gf.speed = parseInt(txt.attr('speed'));
            if (!this.gf.min) this.gf.min = parseInt(txt.css('min-height'));
            if (!this.gf.min) this.gf.min = this.gf.initialH;
            if (!this.gf.max) this.gf.max = parseInt(txt.css('max-height'));
            this.gf.opera9 = ($.browser.opera && $.browser.version < 9.5);
            if (this.gf.restore) { this.gf.restore = false; this._toggleRestore( true );}
            if (this.gf.auto) {
                if (this.gf.initialH == 0) { txt.bind('keyup.growinit', this._afterShowInit); } 
                else { this.gf.auto = false; this._toggleAuto( true ); }
            }
            else this._toggleKeys( true );
            return true;
        };

        this._afterShowInit = function() {
            this.gf.initialH = txt.get(0).offsetHeight;
            if (!this.gf.initialH) return true;
            if (!this.gf.min) this.gf.min = this.gf.initialH;
            txt.unbind('.growinit');
            this.gf.auto = false; 
            this._toggleAuto( true );
            txt.focus();
            return true;
        };

        this._toggleKeys = function( on ) {
            if ( on ) {
                if (this.gf.keysEnabled) return false;
                txt.bind( ($.browser.msie? 'keyup':'keydown')+'.autogrow', function( event ) { 
                    if (!event.ctrlKey || $.inArray(event.keyCode,[38,40])==-1) return true;
                    txt[ event.keyCode==38 ? 'decrease':'increase' ]( false, event );
                    if ($.browser.opera) txt.focus(); // !!
                    if ($.browser.msie || $.browser.opera) return false;
                    return true;
                });
                this.gf.keysEnabled = true;
            } else {
                if (!this.gf.keysEnabled) return false;
                txt.unbind(($.browser.msie? 'keyup':'keydown')+'.autogrow');
                this.gf.keysEnabled = false;
            }
        };

        this._toggleAuto = function( on ) {
            if ($.browser.opera || on ) {
                txt.css('overflow', 'hidden');
                if ($.browser.opera &&  txt.attr('style') && txt.attr('style').indexOf('border') == -1) txt.css('border', '1px solid #ccc'); // see notes
            }
            if ( on ) {
                if (this.gf.auto) return false; 
                this._toggleKeys( false );
                this._createDummy();
                if (this.gf.impossible) { this._growField = false; return false; }
                txt.css('overflow', 'hidden');
                txt.bind('keyup.autogrow', function( event ) { 
                    if (!txt.val()) this._changeSize(this.gf.min, event ); 
                    else return this._changeSize(this._textHeight(), event ); 
                });
                if ( txt.val() ) txt.keyup();
                $(window).bind('resize.autogrow', function( event ) { th.gf.dummy.width( txt.width() );});
                this.gf.auto = true;
            } else {
                if (!this.gf.auto) return false;
                this.gf.dummy.remove();
                this.gf.dummy = null;
                txt.unbind('keyup.autogrow');
                $(window).unbind('resize.autogrow');
                txt.css('overflow', 'auto');
                this.gf.auto = false;
                this._toggleKeys( true );
            }
            return true;
        };

        this._toggleRestore = function( on ) {
            if ( on ) {
                if (this.gf.restore) return false;
                this.gf.restore = true;
                txt.bind('focus.autogrow', function( event, noChange ) {
                    if (!this.gf.auto || noChange || !txt.val()) return true; 
                    else return this._changeSize(this._textHeight(), event );
                });
                txt.bind('blur.autogrow', function( event ) { return this.gf.auto ? this._changeSize( this.gf.min, event ) : true; });
            } else {
                if (!this.gf.restore) return false;
                this.gf.restore = false;
                txt.unbind('focus.autogrow').unbind('blur.autogrow');
                txt.keyup();
            }
        };

        this._changeSize = function( to, event ) {
            if (this.gf.busy) return true;
            if (!event) event = {};
            this._growBefore( event );
            var ovr = txt.css('overflow');

            if (this.gf.max > 0 && to >= this.gf.max) {  // if we have reached the maximum height
                to = this.gf.max;  
                if (ovr == 'hidden') { // if overflow is still hidden, we need to switch it to auto so that user could see the text 
                    txt.css('overflow', 'auto');
                    if (event.type=='keyup') txt.focus();
                    if (event.type=='focus' && this.gf.animate && this.gf.auto) txt.trigger('focus', true); 
                }
            }
            else if (ovr=='auto' && this.gf.auto)  { // if there is a space left (or no maximum is defined) 
                txt.css('overflow', 'hidden');  // we need to switch overflow back to hidden
                if (event.type=='keyup') txt.focus(); // focus event is neccessary 
            } 
            if (this.gf.min > 0 && to <= this.gf.min) to = this.gf.min; // if we have minimum height

            if (to == txt.get(0).offsetHeight) {this.gf.busy=false; return true;}

            return this._animate( txt.get(0).offsetHeight, to, event, ovr);
        };

        this._animate = function( from, to, event, ovr ) {
            if (!this.gf.animate || (ovr == 'auto' && this.gf.auto) ||  event.type == 'init' ) {
                txt.height( to );
                return this._growAfter( event );
            }
            this.gf.queue = Math.floor((this.gf.speed / this.gf.ms) * ( to < from ? -1 : 1));
            this._timeout( from, to );
            return true;
        };

        this._timeout = function( from, to ) {
            if (th.gf.queue==0) return th._growAfter();
            th.gf.queue += (th.gf.queue > 0 ? -1 : 1);
            if ( Math.abs(to-from)<3 ) {
                txt.height( to );
                return th._growAfter();
            }
            from = th.gf.queue == 0 ?  to : from + Math.ceil( (to-from) /2);
            txt.height( from );
            th.gf.timeout = window.setTimeout(function(){ th._timeout(from, to) }, th.gf.ms);
        };

        this._textHeight = function() {
            var val = txt.val();
            if ($.browser.safari && val.substr(-2) == "\n\n") val = val.substring(0,val.length-2)+"\n11"; // empty row fix for safari
            if ($.browser.safari) this.gf.dummy.val(''); // another fix for safari
            this.gf.dummy.val(val); 
            if (this.gf.opera9) this.gf.dummy.css('overflow', 'hidden').css('overflow', 'auto');
            var d = this.gf.dummy.get(0);
            if (this.gf.opera9) return d.clientHeight + this.gf.hOffset;
            if ((d.scrollHeight + ($.browser.safari ? 1 : 0)) > d.clientHeight) {
                return d.scrollHeight +( d.offsetHeight-d.clientHeight) + this.gf.hOffset + ($.browser.safari ? this.gf.hOffset : 0);
            }
            else {
                if ( !txt.val()) return this.gf.min;
                else return d.offsetHeight + this.gf.hOffset;
            } 
        };

        this._createDummy = function() {
            if (this.gf.dummy) { this.gf.dummy.remove(); this.gf.dummy = false; }
            var i = true; var tryPadding = false;
            while (i) {
                this.gf.dummy = txt.clone().css({position:'absolute', left:-9999, top:0, visibility: 'hidden', width: txt.get(0).offsetWidth}).attr('tabindex', -9999);
                 // in hidden mode opera < 9.5 doesn't update scrollHeight, but if we change overflow every time, it almost works
                if (this.gf.opera9) { 
                    this.gf.dummy.css({overflow:'auto', height:'auto'});
                    var padding = txt.css('padding');
                    if ((padding && padding< 4) || tryPadding) this.gf.dummy.css({padding: '4px'}); // !!!! only with padding textarea will update scrollHeight
                }
                this.gf.dummy.get(0)._growField = false;
                txt.after(this.gf.dummy);
                this.gf.dummy.val('').height(10);
                this.gf.dummy.val("11");
                if (this.gf.opera9) this.gf.dummy.css('overflow', 'hidden').css('overflow', 'auto');
                var s1 = this.gf.dummy.get(0).scrollHeight;
                this.gf.dummy.val("11\n11");
                if (this.gf.opera9) this.gf.dummy.css('overflow', 'hidden').css('overflow', 'auto');
                var s2 = this.gf.dummy.get(0).scrollHeight;
                if (!this.gf.hOffset) {
                    this.gf.hOffset = s2-s1;
                    if ($.browser.opera && !this.gf.opera9) this.gf.hOffset += this.gf.dummy.get(0).offsetHeight - this.gf.dummy.height(); 
                }
                if (this.gf.opera9 && this.gf.hOffset==0) {
                    if (tryPadding) i=false;
                    else { tryPadding=true; this.gf.dummy.remove(); continue; }
                }
                else i=false;
            }
        };

        this._growBefore = function( event ) { this.gf.busy = true; this._growCallbackBefore( event ); };
        this._growAfter = function( event ) { 
            if (this.gf.timeout) { 
                window.clearTimeout(this.gf.timeout); 
                this.gf.timeout = false; 
            }
            this.gf.busy = false; 
            this._growCallbackAfter( event ); 
            return true;
        };
        this._growCallbackBefore = function() {};
        this._growCallbackAfter = function() {};
        $(function() { th._growInit(); });
    });
};

$.fn.increase = function( step, event ) { this.each( function() { 
    if (!this._growField || this.gf.auto) return true;
    this._changeSize( this.offsetHeight + (step ? parseInt(step) : this.gf.hOffset), event);
});};
$.fn.decrease = function( step, event ) { this.each( function() { 
    if (!this._growField || this.gf.auto) return true;
    this._changeSize( this.offsetHeight - (step ? parseInt(step) : this.gf.hOffset), event);
});};
$.fn.growToggleAuto = function( bool ) {
    if (bool && bool != true && bool != false && bool.toLowerCase() != 'on' && bool.toLowerCase() != 'off') delete(bool);
    if (bool && typeof(bool)=='string') bool = bool.toLowerCase()=='on' ? true: false; 
    this.each( function() { 
        if (!this._growField) return true; 
        this._toggleAuto(bool);
});};
$.fn.growToggleAnimation = function( bool ) {
    if (bool && bool != true && bool != false && bool.toLowerCase() != 'on' && bool.toLowerCase() != 'off') delete(bool);
    if (bool && typeof(bool)=='string') bool = bool.toLowerCase()=='on' ? true: false; 
    this.each( function() { 
        if (!this._growField) return true; 
        this.gf.animate = bool;
});};
$.fn.growTo = function( h ) { this.each( function() { 
    if (!this._growField) return true; 
    this._changeSize(h);
});};
$.fn.growSetMin = function( h ) { this.each( function() { 
    if (!this._growField) return true;
    h = parseInt(h);
    if (h < 10 && this.gf.initialH) h = this.gf.initialH;
    if (h < 10) return true;
    this.gf.min = parseInt(h);
    if (this.offsetHeight < this.gf.min) $(this).growTo(this.gf.min);
});};
$.fn.growSetMax = function( h ) {  this.each( function() { 
    if (!this._growField) return true;
    this.gf.max = parseInt(h);
    if (this.offsetHeight > this.gf.max) $(this).growTo(this.gf.max);
});};
$.fn.growToggleRestore = function( bool ) {
    if (bool && bool != true && bool != false && bool.toLowerCase() != 'on' && bool.toLowerCase() != 'off') delete(bool);
    if (bool && typeof(bool)=='string') bool = bool.toLowerCase()=='on' ? true: false;  
    this.each( function() { 
        if (!this._growField) return true;
        this._toggleRestore( bool );
});};
$.fn.growRenewDummy = function() { this.each(function(){
    if (!this._growField) return true; 
    this._createDummy();
});};

})(jQuery);