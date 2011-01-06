/**
 * @name $.ui.simplicityFlyout
 * @namespace Flyout UI effect
 */
(function ($) {
  $.widget("ui.simplicityFlyout", {
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
    isOpen: function () {
      return this._isOpen;
    },
    toggle: function () {
      if (!this._isOpen) {
        this.open();
      } else {
        this.close();
      }
    },
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
