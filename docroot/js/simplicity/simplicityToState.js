/**
 * @name $.fn.simplicityToState
 * @function
 * @description
 *
 * Plugin to extract state from input elements.
 * Apply this to input elements to extract their state into a dictionary.
 *
 * @param state
 *   The target <code>Object</code> to extract the state to.
 * @param trimValue
 *   The state value will be trimmed if this is <code>true</code>.
 * @param ignoreEmptyValues
 *   The state value will be ignored if it is empty and this is <code>true</code>. Useful
 *   for applying state on initial page load with multiple inputs mapped to the same fields.
 *
 * @example
 *   var state = {};
 *   $(':input').simplicityToState(state);
 *   console.log(state);
 */
(function ($) {
  $.fn.simplicityToState = function (state, trimValue, ignoreEmptyValues) {
    return this.each(function () {
      var element = $(this);
      var name = $.trim(element.attr('name'));
      if (name !== '') {
        var value = element.val();
        if (element.is(':checkbox')) {
          var checked = element[0].checked;
          if (checked || !ignoreEmptyValues) {
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
        } else if (element[0].nodeName === 'SELECT') {
          if ('undefined' === typeof value || value === '' || value === null) {
            value = [];
          }
          if (value.length > 0) {
            state[name] = value;
          } else if (!ignoreEmptyValues) {
            delete state[name];
          }
        } else if (element.is(':radio') && !element[0].checked) {
          // Ignore change events from unchecked radio buttons
        } else {
          // Input other than checkbox or select
          if ('undefined' === typeof value || value === null) {
            value = '';
          }
          if (trimValue) {
            value = $.trim(value);
          }
          if (value !== '') {
            state[name] = value;
          } else if (!ignoreEmptyValues) {
            delete state[name];
          }
        }
      }
    });
  };
}(jQuery));
