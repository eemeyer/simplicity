/**
 * @name $.ui.simplicityPageSnapBack
 * @namespace Widget that causes the current page to reset to the first when the search state changes.
 * Without  simplicityPageSnapBack, the current search page will not change when executing a
 * new search.
 * <p>
 * This widget listens for the <code>simplicityStateChanging</code> event and uses it to determine
 * if anything other than the page changed in the state. If it did then the page parameter is removed
 * effectively snapping the page back to the first page of the results.
 *
 * @example
 *   $('body').simplicityState();
 *   // Create all simplicityInputs widgets
 *   $('body')
 *     .simplicityState('mergeQueryParams')
 *     .simplicityHistory()
 *     .simplicityState('triggerChangeEvent')
 *     <b>.simplicityPageSnapBack()</b>
 *     .simplicityDiscoverySearch({
 *       url: 'search_controller.php'
 *     })
 *     .simplicityDiscoverySearch('search');
 */
(function ($) {
  $.widget("ui.simplicityPageSnapBack", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
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
     * @name $.ui.simplicityPageSnapBack.options
     */
    options: {
      stateElement: 'body',
      pageParam: 'page',
      debug: false
    },
    _create : function () {
      this
        ._addClass('ui-simplicity-page-snap-back')
        ._bind(this.options.stateElement, 'simplicityStateChanging', this._stateChangingHandler);
    },
    /**
     * Event handler for the <code>simplicityStateChanging</code> event. Removes the page parameter,
     * resetting the state to the first page if the new state changes anything other than
     * the page parameter.
     *
     * @name $.ui.simplicityPageSnapBack._stateChangingHandler
     * @function
     * @private
     */
    _stateChangingHandler: function (evt, prevState, newState) {
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
    }
  });
}(jQuery));
