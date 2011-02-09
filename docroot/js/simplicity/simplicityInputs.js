/**
 * @name $.ui.simplicityInputs
 * @namespace An input element that has 2-way state sync support.
 *
 * This widget should either be applied directly to an input or to any DOM element
 * that contains inputs. Most Simplicity widgets that gather or record user selections
 * require to be bound to a simplicity widget.
 *
 * The values of the bound simplicityInputs are managed by a simplicityState widget.
 */
(function ($) {
  var invalidInputSelector = ':button,:image,:file,:reset,:submit,:password';
  $.widget("ui.simplicityInputs", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>stateElement</dt>
     *   <dd>
     *     The location of the simplicityState widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>changeEvent</dt>
     *   <dd>
     *     The event to bind when listening for change events. Defaults to <code>'change'</code>.
     *   </dd>
     *   <dt>quietStateChange</dt>
     *   <dd>
     *     When set to true cause change events to not propagate past the simplicityState widget.
     *     This allows for incremental, partial updates of the shared state. Defaults to <code>false</code>.
     *   </dd>
     *   <dt>exportStateOnCreate</dt>
     *   <dd>
     *     If the underlying input has a non empty state, export that
     *     to the simplicityState widget. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>supportsReset</dt>
     *   <dd>
     *     When <code>true</code this widget listens for a <code>simplicityStateReset</code> event
     *     to remove it's parameter from the state object. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>trim</dt>
     *   <dd>
     *     When <code>true</code> causes leading and trailing whitespace to be removed from the
     *     wrapped input(s) value when applying it to the state. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>debug</dt>
     *   <dd>
     *     Enable logging of key events to console.log. Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityInputs.options
     */
    options: {
      stateElement: 'body',
      changeEvent: 'change',
      quietStateChange: false,
      exportStateOnCreate: true,
      supportsReset: true,
      trim: true,
      debug: false
    },
    _create: function () {
      if (this.element.is(invalidInputSelector)) {
        // We don't want to empty out the value attribute for these
        // kinds of elements or potentially hijack their change events.
        return;
      }
      this.element.addClass('ui-simplicity-inputs');
      this.element.bind(this.options.changeEvent, $.proxy(this._changeHandler, this));
      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
      $(this.options.stateElement).bind('simplicityStateReset', $.proxy(this._stateResetHandler, this));
      if (this.options.exportStateOnCreate) {
        var state = $(this.options.stateElement).simplicityState('state');
        this.element.simplicityToState(state, this.options.trim, true);
        $(this.options.stateElement).simplicityState('state', state, false);
      }
    },
    /**
     * Returns the wrapped input or inputs.
     *
     * @name $.ui.simplicityInputs.inputs
     * @function
     */
    inputs: function () {
      return this.element.is(':input') ? this.element : this.element.find(':input').not(invalidInputSelector);
    },
    /**
     * Resets the input(s) to an empty state by altering the current state and triggering a state change.
     *
     * @name $.ui.simplicityInputs.reset
     * @function
     */
    reset: function () {
      var state = $(this.options.stateElement).simplicityState('state');
      this._reset(state);
      $(this.options.stateElement).simplicityState('state', state, this.options.quietStateChange ? false : undefined);
    },
    /**
     * Handler for change events. When the underlying input is changed this
     * handler updates the state of the associated simplicityState widget
     * with this data.
     *
     * @name $.ui.simplicityInputs._changeHandler
     * @function
     * @private
     */
    _changeHandler: function (evt) {
      if (!this._ignoreChangeEvent && evt.target === this.element[0]) {
        var state = $(this.options.stateElement).simplicityState('state');
        this.inputs().simplicityToState(state, this.options.trim);
        $(this.options.stateElement).simplicityState('state', state, this.options.quietStateChange ? false : undefined);
      }
    },
    /**
     * Handler for simplicityStateChange events. When the associated
     * simplicityState widget gets a new state this handler updates the
     * underlying input to reflect the new state.
     *
     * @name $.ui.simplicityInputs._stateChangeHandler
     * @function
     * @private
     */
    _stateChangeHandler: function (evt, state) {
      if (this.options.debug) {
        console.log('simplicityInputs: Handling simplicityStateChange event for', this.element, 'with state', state);
      }
      try {
        this._ignoreChangeEvent = true;
        this.inputs().simplicityFromState(state, true, this.options.debug);
      } finally {
        this._ignoreChangeEvent = false;
      }
      if (this.options.debug) {
        console.log('simplicityInputs: Handled simplicityStateChange event for', this.element, 'with state', state);
      }
    },
    /**
     * Handler for simplicityStateReset events. When the option <code>supportsReset</code> is
     * <code>true</code> this handler will reset the bound parameters.
     *
     * @name $.ui.simplicityInputs._stateResetHandler
     * @function
     * @private
     */
    _stateResetHandler: function (evt, state) {
      if (this.options.supportsReset) {
        this._reset(state);
      }
    },
    /**
     * Implementation of reset, used by <code>reset</code> and <code>_stateResetHandler</code>.
     *
     * @name $.ui.simplicityInputs._reset
     * @function
     * @private
     */
    _reset: function (state) {
      this.inputs().each($.proxy(function (idx, element) {
        var name = $.trim($(element).attr('name'));
        if (name !== '' && name in state) {
          if (this.options.debug) {
            console.log('simplicityInputs: Resetting state parameter', name, 'for', element);
          }
          delete state[name];
        }
      }, this));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-inputs');
      this.element.unbind(this.options.changeEvent, this._changeHandler);
      $(this.options.stateElement).unbind('simplicityStateChange', this._stateChangeHandler);
      $(this.options.stateElement).unbind('simplicityStateReset', this._stateResetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });

}(jQuery));
