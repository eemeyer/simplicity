/**
 * @name $.simplicityProxy
 * @function
 * @description
 *
 * Variation of $.proxy that doesn't share a guid and thus allows
 * for unbinding a single proxied function from an event.
 *
 * @param fn
 *   The function to proxy.
 * @param thisObject
 *   The object to apply the function to.
 *
 * @example
 *   var clickHandler = $.simplicityProxy(function () {}, this);
 *   $('#example').bind('click', clickHandler);
 *   // Do something
 *   $('#example).unbind('click', clickHandler);
 */
(function ($) {
  $.simplicityProxy = function (fn, thisObject) {
    return function () {
      var currentFn = ('string' === typeof fn) ? thisObject[fn] : fn;
      return currentFn.apply(thisObject, arguments);
    };
  };
}(jQuery));
