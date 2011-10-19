/**
 * @name $.ui.simplicityFlyout
 * @namespace Flyout UI effect.
 *
 * A flyout widget that can open and close.
 * <p>
 * Automatically applies the <a href="http://plugins.jquery.com/project/bgiframe">bgiframe plugin</a>
 * to the element if available.
 *
 * @example
 *   &lt;div id="flyout">
 *     &lt;ul>
 *       &lt;li>one&lt;/li>
 *       &lt;li>two&lt;/li>
 *       &lt;li>three&lt;/li>
 *     &lt;/ul>
 *   &lt;div>
 *   &lt;button id="toggle">Toggle&lt;/button>
 *   &lt;script type="text/javascript">
 *     $('#flyout').simplicityFlyout({
 *       // All of these options are optional
 *       effect: 'slide',
 *       effectOptions: {
 *         duration: 1000
 *       },
 *       position: {
 *         my: 'left top',
 *         at: 'right top',
 *         of: '#toggle',
 *         collision: 'none'
 *       }
 *     });
 *     $('#toggle').click(function () {
 *       $('#flyout').simplicityFlyout('toggle');
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityFlyout", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>effect</dt>
     *   <dd>
     *     The jQuery UI effect to use when hiding or showing the flyout. Must be one compatible
     *     with show/hide/toggle (see http://docs.jquery.com/UI/Effects). Possible options are
     *     blind, clip, drop, explode, fade, fold, puff, slide and scale.
     *     Defaults to <code>'show'</code>.
     *   </dd>
     *   <dt>effectOptions</dt>
     *   <dd>
     *     Optional options for the configured effect. If set to <code>''</code> then no
     *     special options are passed in, otherwise it should be an object containing effect
     *     options.
     *     Defaults to <code>''</code>
     *   </dd>
     *   <dt>position</dt>
     *   <dd>
     *     Optional positioning options. If set to <code>''</code> then no positioning is
     *     performed, otherwise it should be an object containing options
     *     for the jQuery UI position plugin (see http://jqueryui.com/demos/position/).
     *   </dd>
     *   <dt>css</dt>
     *   <dd>
     *     Optional css overrides. If set to <code>''</code> then no overrides are performed,
     *     otherwise it should be an object containing css that is valid for calls to
     *     <code>$.css</code> (see http://api.jquery.com/css/).
     *     Defaults to <code>''</code></dd>
     *   <dt>hiddenAccessible</dt>
     *   <dd>
     *     Boolean option to enable or disable <code>ui-helper-hidden-accessible</code> support.
     *     When enabled the flyout has this class applied to it and is made visible before positioning.
     *     Defaults to <code>true</code></dd>
     *   <dt>closeSelector</dt>
     *   <dd>
     *     Selector that click events are bound to to close the flyout. Defaults to <code>'.flyout-close'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFlyout.options
     */
    options : {
      effect: 'show',
      effectOptions: '',
      position: '',
      css: '',
      hiddenAccessible: true,
      closeSelector: '.flyout-close'
    },
    _create : function () {
      this._addClass('ui-simplicity-flyout');
      this._isOpen = false;
      if ('undefined' !== typeof $.bgiframe) {
        this.element.bgiframe();
      }
      this._addHiddenAccessible();
      this._bind(this.element.find(this.options.closeSelector), 'click', function (evt, ui) {
        this.close();
        return false;
      });
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
        this._addHiddenAccessible();
        var position = this.options.position;
        this.element.css({
          position: position !== '' ? 'absolute' : 'static',
          top: 0,
          left: 0
        });
        if (this.options.css !== '') {
          this.element.css(this.options.css);
        }
        if (position !== '') {
          this.element.position(this.options.position);
        }
        this._removeHiddenAccessible();
        if (this.options.effect === 'show') {
          this.element.show();
        } else {
          var effectOptions = this.options.effectOptions;
          effectOptions = effectOptions !== '' ? $.extend({}, effectOptions) : {};
          this.element.show(this.options.effect, effectOptions);
        }
      }
    },
    _removeHiddenAccessible: function () {
      if (this.options.hiddenAccessible) {
        this.element
          .hide()
          .removeClass('ui-helper-hidden-accessible');
      }
    },
    _addHiddenAccessible: function () {
      if (this.options.hiddenAccessible) {
        this.element
          .addClass('ui-helper-hidden-accessible')
          .show();
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
        if (this.options.effect === 'show') {
          this.element.hide();
          this._addHiddenAccessible();
        } else {
          var effectOptions = this.options.effectOptions;
          effectOptions = effectOptions !== '' ? $.extend({}, effectOptions) : {};
          if (this.options.hidddenAccessible) {
            effectOptions.complete = $.proxy(this._addHiddenAccessible, this);
          }
          this.element.hide(this.options.effect, effectOptions);
        }
      }
    }
  });
}(jQuery));
