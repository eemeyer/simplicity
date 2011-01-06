/**
 * @name $.ui.simplicityState
 * @namespace State widget used to gather current selection from multiple input elements
 *
 * <h2>Options</h2>
 * <dl>
 *   <dt>initialState</dt>
 *   <dd>
 *     The initial state of this widget. Defaults to <code>{}</code>.
 *   </dd>
 *   <dt>debug</dt>
 *   <dd>
 *     Enable logging of key events to console.log. Defaults to false.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.widget("ui.simplicityState", {
    options: {
      initialState: {},
      debug: false
    },
    _create : function () {
      this.element.addClass('ui-simplicity-state');
      this._state = JSON.stringify(this.options.initialState);
    },
    /**
     * Reads the state from the current query string and merges it into
     * the current state. Usually called on initial page load.
     *
     * @name $.ui.simplicityState.mergeQueryParams
     * @function
     */
    mergeQueryParams: function (triggerChangeEventStyle) {
      var state = this.state();
      $.extend(state, $.deparam($.param.querystring()));
      // Remove any properties from this object whose value is the empty string
      var keysToRemove = [];
      for (var k in state) {
        if (state[k] === '') {
          delete state[k];
        }
      }
      this.state(state, triggerChangeEventStyle);
    },
    /**
     * Get or retrieve the current state. Returning the state when
     * called with no arguments and setting it otherwise.
     *
     * @name $.ui.simplicityState.state
     * @function
     * @param state The new state
     * @param triggerChangeEventStyle Style used to determine when to
     *   trigger a simplicityStateChangeEvent. Defaults to <code>undefined</code>.
     *   Valid styles are:
     *   <dl>
     *     <dt>undefined</dt><dd>trigger if changed</dd>
     *     <dt>true</dt><dd>always trigger</dd>
     *     <dt>false</dt><dd>never trigger</dd>
     *   </dl>
     */
    state: function (state, triggerChangeEventStyle) {
      if (arguments.length === 0) {
        // Get the current state
        return JSON.parse(this._state);
      } else {
        // Set the current state
        var prevState = this.state();
        var newStateVal = JSON.stringify(state);
        // Explicitly deserialize both states from JSON to ensure they are data only
        // and then perform a deep equality check to avoid depending on the order
        // of keys in the Objects.
        var newState = JSON.parse(newStateVal);
        var stateChanged = !$.simplicityEquiv(prevState, newState);
        if (stateChanged) {
          if (this.options.debug) {
            console.log('simplicityState: Triggering simplicityStateChanging event for', this.element, 'from', prevState, 'to', newState);
          }
          this.element.triggerHandler('simplicityStateChanging', [prevState, newState]);
          if (this.options.debug) {
            console.log('simplicityState: Triggered simplicityStateChanging event for', this.element, 'from', prevState, 'to', newState);
          }
          stateChanged = !$.simplicityEquiv(prevState, newState);
          if (stateChanged) {
            newStateVal = JSON.stringify(newState);
            this._state = newStateVal;
            if (this.options.debug) {
              console.log('simplicityState: Changed state from', prevState, 'to', newState, 'for', this.element, 'with triggerChangeEventStyle', triggerChangeEventStyle);
            }
          }
        }
        if (triggerChangeEventStyle === true ||
          (stateChanged && 'undefined' === typeof triggerChangeEventStyle)) {
          this._triggerChangeEvent(newStateVal);
        }
      }
    },
    /**
     * Triggers a simplicityStateChange event with the current state. Usually
     * called on initial page load.
     *
     * @name $.ui.simplicityState.triggerChangeEvent
     * @function
     */
    triggerChangeEvent: function () {
      this._triggerChangeEvent(this._state);
    },
    _triggerChangeEvent: function (stateVal) {
      if (this.options.debug) {
        console.log('simplicityState: Triggering simplicityStateChange event for', this.element, 'with state', JSON.parse(stateVal));
      }
      this.element.triggerHandler('simplicityStateChange', [JSON.parse(stateVal)]);
      if (this.options.debug) {
        console.log('simplicityState: Triggered simplicityStateChange event for', this.element, 'with state', JSON.parse(stateVal));
      }
    },
    /**
     * Resets the current state by sending out a <code>simplicityStateReset</code> event which allows
     * any listening widgets to clear out their parameters.
     *
     * @name $.ui.simplicityState.reset
     * @function
     */
    reset: function () {
      if (this.options.debug) {
        console.log('simplicityState: Resetting state for', this.element, 'from state', this.state());
      }
      var state = this.state();
      this.element.triggerHandler('simplicityStateReset', [state]);
      this.state(state);
      if (this.options.debug) {
        console.log('simplicityState: Reset state for', this.element, 'to state', state);
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-state');
      this.element.unbind('change', this._changeHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
