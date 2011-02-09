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
(function ($) {
  $.widget("ui.simplicityHistory", {
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
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-history');

      if (this.options.noEscape !== '') {
        $.param.fragment.noEscape(this.options.noEscape);
      }

      this.initialState = $(this.options.stateElement).simplicityState('state');
      if (this.options.debug) {
        console.log('simplicityHistory: Initial state is', this.initialState);
      }

      var fragment = $.param.fragment();
      if (fragment !== '') {
        var state = $.deparam(fragment);
        if ($.isEmptyObject(state)) {
          if (this.options.debug) {
            console.log('simplicityHistory: Hash state is deparams as empty, ignoring: "' + fragment + '"');
          }
        } else {
          if (this.options.debug) {
            console.log('simplicityHistory: Restoring hash state', state);
          }
          $(this.options.stateElement).simplicityState('state', state);
        }
      }
      $(window).bind('hashchange', $.proxy(this._hashChangeHandler, this));
      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
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
      var state;
      if ('' === evt.fragment) {
        state = this.initialState;
        if (this.options.debug) {
          console.log('simplicityHistory: Hash state is empty, restoring initial page state', state);
        }
      } else {
        state = $.deparam(evt.fragment);
        if (this.options.debug) {
          console.log('simplicityHistory: Back or forward button was activated, applying state', state);
        }
      }
      try {
        this._ignoreStateChange = true;
        $(this.options.stateElement).simplicityState('state', state);
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
        var fragment = $.param.fragment();
        var fragmentState = $.deparam(fragment);
        var newFragment = undefined;
        if (fragment === '') {
          if ($.simplicityEquiv(this.initialState, state)) {
            if (this.options.debug) {
              console.log('simplicityHistory: State reset to initial page state, leaving the hash state empty');
            }
          } else {
            newFragment = $.param.fragment('', state);
          }
        } else if ($.simplicityEquiv(fragmentState, state)) {
          if (this.options.debug) {
            console.log('simplicityHistory: Ignoring state change as is matches current history, state is', state, 'fragment is', decodeURIComponent(fragment));
          }
        } else {
          newFragment = $.param.fragment('', state);
        }
        if ('undefined' !== typeof newFragment) {
          if (this.options.debug) {
            console.log('simplicityHistory: Updating hash state', state, newFragment);
          }
          $.bbq.pushState(newFragment);
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-history');
      $(window).bind('hashchange', this._hashChangeHandler);
      $(this.options.stateElement).unbind('simplicityStateChange', this._stateChangeHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
