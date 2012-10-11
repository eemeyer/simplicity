/**
 * @name $.ui.simplicityHistory
 * @namespace Ajax history widget for simplicityState
 *
 * This widget binds the simplicityState to the hash fragment of the URL making it possible
 * to use the browser's forward/backward buttons or create a bookmark to a specific
 * search page. The simplicityHistory widget also enables users to search
 * for results, then use the back button to restore/refine the criteria used to
 * perform the search.
 * <p>
 * This widget should be instantiated no more than one time per page.
 *
 * @see Depends on the <a href="http://benalman.com/projects/jquery-bbq-plugin">jQuery BBQ plugin</a>.
 *
 * @example
 *   $('body').simplicityState();
 *   // Create all simplicityInputs widgets
 *   $('body')
 *     .simplicityState('mergeQueryParams')
 *     <b>.simplicityHistory()</b>
 *     .simplicityState('triggerChangeEvent')
 *     .simplicityPageSnapBack()
 *     .simplicityDiscoverySearch({
 *       url: 'search_controller.php'
 *     })
 *     .simplicityDiscoverySearch('search');
 */
(function ($, window) {
  $.widget("ui.simplicityHistory", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>stateElement</dt>
     *   <dd>
     *     The location of the simplicityState widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>noEscape</dt>
     *   <dd>
     *     Optional list of characters that should not be escaped. Defaults to <code>''</code>.
     *     This is just a convenience that calls <code>$.param.fragment.noEscape</code> when
     *     not the empty string.
     *   </dd>
     *   <dt>acceptMissingBang</dt>
     *   <dd>
     *     Determines if URLs without a bang (!) should be accepted. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to <code>console.log</code>. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityHistory.options
     */
    options : {
      stateElement: 'body',
      noEscape: '',
      acceptMissingBang: false,
      debug: false
    },
    _create : function () {
      this._addClass('ui-simplicity-history');

      if (this.options.noEscape !== '') {
        $.param.fragment.noEscape(this.options.noEscape);
      }

      this.initialState = $(this.options.stateElement).simplicityState('state');
      if (this.options.debug) {
        console.log('simplicityHistory: Initial state is', this.initialState);
      }
      this
        ._bind(window, 'statechange', this._hashChangeHandler)
        ._bind(this.options.stateElement, 'simplicityStateChange', this._stateChangeHandler);
    },
    /**
     * Event handler for the <code>hashchange</code> event. Applies the new hash state to the
     * simplicityState.
     *
     * @name $.ui.simplicityHistory._hashChangeHandler
     * @function
     * @private
     */
    _hashChangeHandler: function (evt) {
      var state = History.getState();
      try {
        this._ignoreStateChange = true;
        $(this.options.stateElement).simplicityState('state', state.data);
      } finally {
        this._ignoreStateChange = false;
      }
    },
    /**
     * Event handler for the <code>simplicityStateChange</code> event. Applies the state to
     * the browser history (hash fragment).
     *
     * @name $.ui.simplicityHistory._stateChangeHandler
     * @function
     * @private
     */
    _stateChangeHandler: function (evt, state) {
      if (!this._ignoreStateChange) {
        var fragment = $.param.fragment('', state);
        var url = fragment && fragment !== '#' ? '?' + fragment.substr(1) : '';
        History.pushState(state, null, url);
      }
    }
  });
}(jQuery, window));
