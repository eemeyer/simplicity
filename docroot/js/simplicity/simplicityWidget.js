/**
 * @name $.ui.simplicityWidget
 * @namespace Base class widget to automate common actions.
 */
(function ($) {
  $.widget("ui.simplicityWidget", {
    /**
     * Wrapper around $.addClass that registers a destroy hook.
     *
     * @name $.ui.simplicityWidget._addClass
     * @function
     * @param target Optional selector or DOM node, if missing defaults to this.element.
     * @param cssClass CSS class to add
     */
    _addClass: function (target, cssClass) {
      if (arguments.length === 1) {
        cssClass = target;
        target = this.element;
      } else {
        target = $(target);
      }
      target.addClass(cssClass);
      return this._registerDestroyHook(function () {
        target.removeClass(cssClass);
      });
    },
    /**
     * Wrapper around $.bind that registers a destroy hook.
     *
     * The traditional use of:
     * @example
     *   $(selector).bind('click', $.proxy(this._handler, this));
     *
     * Would be written as:
     * @example
     *     this._bind(selector, 'click', this._handler);
     *
     * @name $.ui.simplicityWidget._bind
     * @function
     * @param target Optional selector or DOM node, if missing defaults to this.element.
     * @param eventName The event to bind to
     * @param handler Handler function or name (looked up against this) which is automatically proxied.
     */
    _bind: function (target, eventName, handler) {
      if (arguments.length === 2) {
        handler = eventName;
        eventName = target;
        target = this.element;
      } else {
        target = $(target);
      }
      var proxy = $.simplicityProxy(handler, this);
      target.bind(eventName, proxy);
      return this._registerDestroyHook(function () {
        target.unbind(eventName, proxy);
      });
    },
    /**
     * Register a function to be called during widget destruction.
     *
     * @name $.ui.simplicityWidget._registerDestroyHook
     * @function
     * @param destroyHook The function to be registered
     */
    _registerDestroyHook: function (destroyHook) {
      if ('undefined' === typeof this._destroyHooks) {
        this._destroyHooks = [];
      }
      this._destroyHooks.push(destroyHook);
      return this;
    },
    /**
     * Widget destructor, runs any registered destroy hooks.
     *
     * @name $.ui.simplicityWidget.destroy
     * @function
     */
    destroy: function () {
      if ('undefined' !== typeof this._destroyHooks) {
        $.each(this._destroyHooks, $.proxy(function (idx, destroyHook) {
          destroyHook.apply(this, arguments);
        }, this));
        this._destroyHooks.length = 0;
      }
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
