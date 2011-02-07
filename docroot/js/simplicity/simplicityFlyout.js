/**
 * @name $.ui.simplicityFlyout
 * @namespace Flyout UI effect.
 *
 * A flyout widget that can open and close.
 * <p>
 * Be careful using this with checkboxes and Internet Explorer as IE does not handle
 * hidden checkboxes well.
 * <p>
 * Automatically applies the <a href="http://plugins.jquery.com/project/bgiframe">bgiframe plugin</a>
 * to the element if available.
 */
(function ($) {
  $.widget("ui.simplicityFlyout", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>effect</dt>
     *   <dd>
     *     The jQuery effect to use when hiding or showing the flyout. Defaults to <code>'show'</code>.
     *   </dd>
     *   <dt>closeSelector</dt>
     *   <dd>
     *     Selector that click events are bound to to close the flyout. Defaults to <code>'.flyout-close'</code>.
     *   </dd>
     *   <dt>positionSelector</dt>
     *   <dd>
     *     Optional selector for an element that is used to position the flyout. Defaults to <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFlyout.options
     */
    options : {
      effect: 'slow',
      closeSelector: '.flyout-close',
      positionSelector: ''
    },
    _create : function () {
      this.element.addClass('ui-simplicity-flyout');
      this._isOpen = false;
      if ('undefined' !== typeof $.bgiframe) {
        this.element.bgiframe();
      }
      this.element.find(this.options.closeSelector).click($.proxy(function (evt, ui) {
        this.close();
        return false;
      }, this));
    },
    /**
     * Returns <code>true</code> if the flyout is currently open, <code>false</code> otherwise.
     *
     * @name $.ui.simplicityFlyout.isOpen
     * @function
     */
    isOpen: function () {
      return this._isOpen;
    },
    /**
     * Toggles the open/close state of this flyout.
     *
     * @name $.ui.simplicityFlyout.toggle
     * @function
     */
    toggle: function () {
      if (!this._isOpen) {
        this.open();
      } else {
        this.close();
      }
    },
    /**
     * Opens the flyout, does nothing it it is already open.
     *
     * @name $.ui.simplicityFlyout.open
     * @function
     */
    open: function () {
      if (!this._isOpen) {
        this._isOpen = true;
        if (this.options.positionSelector !== '') {
          var positionElement = $(this.options.positionSelector);
          var css = {
              position: 'absolute',
              top: positionElement.offset().top,
              left: positionElement.outerWidth() + positionElement.offset().left
            };
          if (this.options.width !== '') {
            css.width = this.options.width;
          }
          this.element
            .hide()
            .removeClass('ui-helper-hidden-accessible')
            .css(css);
        }
        this.element.show(this.options.effect);
      }
    },
    /**
     * Closes the flyout, does nothing it it is already closed.
     *
     * @name $.ui.simplicityFlyout.close
     * @function
     */
    close: function () {
      if (this._isOpen) {
        this._isOpen = false;
        this.element.hide(this.options.effect);
        if (this.options.positionSelector !== '') {
          this.element
            .addClass('ui-helper-hidden-accessible')
            .show();
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-flyout');
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
