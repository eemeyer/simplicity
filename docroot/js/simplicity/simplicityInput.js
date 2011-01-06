/**
 * @name $.ui.simplicityInput
 * @namespace An input element that has 2-way state sync support.
 *
 * <h2>Options</h2>
 * <dl>
 *   <dt>stateElement</dt>
 *   <dd>
 *     The location of the simplicityState widget. Defaults to <code>'body'</code>.
 *   </dd>
 *   <dt>changeEvent</dt>
 *   <dd>
 *     The event to bind when listening for change events. Defaults to <code>'change'</code>.
 *   </dd>
 *   <dt>exportStateOnCreate</dt>
 *   <dd>
 *     If the underlying input has a non empty state, export that
 *     to the simplicityState widget. Defaults to <code>true</code>.
 *   </dd>
 *   <dt>supportsReset</dt>
 *   <dd>
 *     When true this widget listens for a <code>simplicityStateReset</code> event
 *     to remove it's parameter from the state object. Defaults to <code>true</code>.
 *   </dd>
 *   <dt>debug</dt>
 *   <dd>
 *     Enable logging of key events to console.log. Defaults to <code>false</code>.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.widget("ui.simplicityInput", {
    options: {
      stateElement: 'body',
      changeEvent: 'change',
      exportStateOnCreate: true,
      supportsReset: true,
      debug: false
    },
    _create: function () {
      if (this.element.is(':button,:image,:file,:reset,:submit,:password')) {
        // We don't want to empty out the value attribute for these
        // kinds of elements or potentially hijack their change events.
        return;
      }
      this.element.addClass('ui-simplicity-input');
      this.element.bind(this.options.changeEvent, $.proxy(this._changeHandler, this));
      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
      $(this.options.stateElement).bind('simplicityStateReset', $.proxy(this._stateResetHandler, this));
      if (this.options.exportStateOnCreate) {
        this._changeHandler({type: 'simplicityInputExportStateOnCreate'});
      }
    },
    /**
     * Handler for change events. When the underlying input is changed this
     * handler updates the state of the associated simplicityState widget
     * with this data.
     * @private
     */
    _changeHandler: function (evt) {
      if (this._ignoreChangeEvent) {
        return;
      }
      // exportStateOnCreate is a special case, in this mode we only care about additions to the
      // state. It is used for initial state setup from default input values on the page.
      // An empty input shouldn't tread of the state of an otherwise valid one.
      var exportStateOnCreate = evt.type === 'simplicityInputExportStateOnCreate';
      var state = $(this.options.stateElement).simplicityState('state');
      var name = $.trim($(this.element).attr('name'));
      if (name === '') {
        return;
      }
      var value = $(this.element).val();
      if (this.element.is(':checkbox')) {
        var checked = this.element[0].checked;
        if (checked || !exportStateOnCreate) {
          var values = state[name];
          if ('undefined' === typeof values || values === null || values === '') {
            values = [];
          } else if (!$.isArray(values)) {
            values = [values];
          }
          if (checked) {
            if (-1 === $.inArray(value, values)) {
              values.push(value);
            }
          } else {
            values = $.grep(values, function (elem, idx) {
              return elem !== value;
            });
          }
          if (values.length === 0) {
            delete state[name];
          } else if (values.length === 1) {
            state[name] = values[0];
          } else {
            state[name] = values;
          }
        }
      } else if (this.element[0].nodeName === 'SELECT') {
        value = value || [];
        if (value.length > 0) {
          state[name] = value;
        } else if (!exportStateOnCreate) {
          delete state[name];
        }
      } else if (this.element.is(':radio') && !this.element[0].checked) {
        // Ignore change events from unchecked radio buttons
      } else {
        // Input other than checkbox or select
        value = $.trim(value || '');
        if (value !== '') {
          state[name] = value;
        } else if (!exportStateOnCreate) {
          delete state[name];
        }
      }
      $(this.options.stateElement).simplicityState('state', state, !exportStateOnCreate);
    },
    /**
     * Handler for simplicityStateChange events. When the associated
     * simplicityState widget gets a new state this handler updates the
     * underlying input to reflect the new state.
     * @private
     */
    _stateChangeHandler: function (evt, state) {
      var name = $(this.element).attr('name');
      if (name === '') {
        return;
      }
      if (this.options.debug) {
        console.log('simplicityInput: Handling simplicityStateChange event for', this.element, 'with state', state);
      }
      var updatedInput = false;
      var searchValue = state[name];
      if (this.element.is(':checkbox')) {
        if (!$.isArray(searchValue)) {
          searchValue = [searchValue];
        }
        var myValue = this.element.attr('value');
        var checkCheckBox = (-1 !== $.inArray(myValue, searchValue || []));
        if (checkCheckBox !== this.element[0].checked) {
          this.element[0].checked = checkCheckBox;
          updatedInput = true;
        }
      }
      else if (this.element.is(':radio')) {
        var checkRadio = (this.element.attr('value') === searchValue);
        if (checkRadio !== this.element[0].checked) {
          this.element[0].checked = checkRadio;
          updatedInput = true;
        }
      } else {
        if (this.element.val() !== searchValue) {
          this.element.val(searchValue);
          updatedInput = true;
        }
      }
      if (updatedInput) {
        if (this.options.debug) {
          console.log('simplicityInput: Triggering change event on', this.element);
        }
        try {
          this._ignoreChangeEvent = true;
          this.element.change();
        } finally {
          this._ignoreChangeEvent = false;
        }
        if (this.options.debug) {
          console.log('simplicityInput: Triggered change event on', this.element);
        }
      }
      if (this.options.debug) {
        console.log('simplicityInput: Handled simplicityStateChange event for', this.element, 'with state', state);
      }
    },
    _stateResetHandler: function (evt, state) {
      if (this.options.supportsReset) {
        var name = $.trim($(this.element).attr('name'));
        if (name !== '' && name in state) {
          if (this.options.debug) {
            console.log('simplicityInput: Resetting state parameter', name, 'for', this.element);
          }
          delete state[name];
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-input');
      this.element.unbind(this.options.changeEvent, this._changeHandler);
      $(this.options.stateElement).unbind('simplicityStateChange', this._stateChangeHandler);
      $(this.options.stateElement).unbind('simplicityStateReset', this._stateResetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });

}(jQuery));
