(function ($) {
  $.widget("ui.simplicityStateExampleEditor", $.ui.simplicityWidget, {
    options: {
      stateElement: ''
    },
    _create : function () {
      if (!this.element.is('textarea')) {
        return;
      }
      if (this.options.stateElement === '') {
        this.options.stateElement = this.element;
      }
      this
        ._addClass('ui-simplicity-state-example-editor')
        ._bind('change', this._val_handler)
        ._bind(this.options.stateElement, 'simplicityStateChange', this._state_handler);
    },
    _val_handler: function () {
      var value = this.element.val(),
          parsed = null;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        try {
          parsed = eval( '(' + value + ')');
        } catch (e) {
          parsed = null;
        }
      }
      if (parsed === null) {
        this.element.addClass('ui-state-error')
      } else {
        this.element
          .removeClass('ui-state-error')
          .val(JSON.stringify(parsed, null, '    '));
        $(this.options.stateElement).simplicityState('state', parsed);
      }
    },
    _state_handler: function(evt, state) {
      this.element.val(JSON.stringify(state, null, '    '));
    }
  });
}(jQuery));
