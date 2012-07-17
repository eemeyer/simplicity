/**
 * @name $.ui-fix.autocomplete
 *
 * Patch to $.ui.autocomplete to resolve http://bugs.jqueryui.com/ticket/7555.
 * Applies only to jQuery UI versions 1.8 and earlier.
 */
(function ($) {
  var version = $.ui ? $.ui.version || "1.5.2" : '';
  var v = version.split('.');
  if (('undefined' === typeof v[0] || v[0] === '1') && ('undefined' === typeof v[1] || v[1] < '9')) {
    // Version before 1.9 requires this patch
    $.widget("ui-fix.autocomplete", $.ui.autocomplete, {
      _create : function () {
        $.ui.autocomplete.prototype._create.apply(this, arguments);
        var blur = this.menu.options.blur;
        this.menu.options.blur = function () {
          if (this.pending === 0) {
            blur.apply(this, arguments);
          }
        };
      }
    });
  }
}(jQuery));
