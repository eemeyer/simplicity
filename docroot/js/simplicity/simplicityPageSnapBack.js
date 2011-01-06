/**
 * @name $.ui.simplicityPageSnapBack
 * @namespace Widget that causes the current page to reset to the first when the search state changes
 *
 * <h2>Options</h2>
 * <dl>
 *   <dt>stateElement</dt>
 *   <dd>
 *     The simplicityState widget that this widget binds it's events to. Defaults to <code>'body'</code>.
 *   </dd>
 *   <dt>pageParam</dt>
 *   <dd>
 *     The parameter in the state where the current page is stored. Defaults to <code>'page'</code>.
 *   </dd>
 *   <dt>debug</dt>
 *   <dd>
 *     Enable logging of key events to console.log. Defaults to <code>false</code>.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.widget("ui.simplicityPageSnapBack", {
    options: {
      stateElement: 'body',
      pageParam: 'page',
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-page-snap-back');
      $(this.options.stateElement).bind('simplicityStateChanging', $.proxy(this._stateChangingHandler, this));
    },
    _stateChangingHandler: function (evt, prevState, newState) {
      var pageParam = 'page';
      var prevCopy = JSON.parse(JSON.stringify(prevState));
      var newCopy = JSON.parse(JSON.stringify(newState));
      delete prevCopy[this.options.pageParam];
      delete newCopy[this.options.pageParam];
      if (!$.simplicityEquiv(prevCopy, newCopy)) {
        if (this.options.debug) {
          console.log('simplicityPageSnapBack: State changed, snapping page back');
        }
        delete newState[this.options.pageParam];
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-page-snap-back');
      $(this.options.stateElement).unbind('simplicityStateChanging', this._stateChangingHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
