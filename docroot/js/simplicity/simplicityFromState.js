/**
 * @name $.fn.simplicityFromState
 * @function
 * @description
 *
 * Plugin to apply state to input elements.
 * Apply this to input elements to change their state based on a state <code>Object</code>.
 *
 * @param state
 *   The target <code>Object</code> to extract the state to.
 * @param triggerChange
 *   Optional argument, when <code>true</code> invokes <code>change()</code> on any elements
 *   that were changed.
 * @param debug
 *   Optional argument, when <code>true</code> enables logging via <code>console.log</code>.
 *
 * @example
 *   var state = {
 *     "shape": "circle",
 *     "size": ["small", "medium"]
 *   };
 *   $(':input').simplicityFromState(state);
 */
(function ($) {
  $.fn.simplicityFromState = function (state, triggerChange, debug) {
    return this.each(function () {
      var element = $(this);
      var name = element.attr('name');
      if (name !== '') {
        var changed = false;
        var searchValue = state[name];
        if (element.is(':checkbox')) {
          if (!$.isArray(searchValue)) {
            searchValue = [searchValue];
          }
          var myValue = element.attr('value');
          var checkCheckBox = (-1 !== $.inArray(myValue, searchValue || []));
          if (checkCheckBox !== element[0].checked) {
            element[0].checked = checkCheckBox;
            changed = true;
          }
        }
        else if (element.is(':radio')) {
          var checkRadio = (element.attr('value') === searchValue);
          if (checkRadio !== element[0].checked) {
            element[0].checked = checkRadio;
            changed = true;
          }
        } else {
          if (element.val() !== searchValue) {
            element.val(searchValue);
            changed = true;
          }
        }
        if (changed && triggerChange) {
          if (debug) {
            console.log('simplicityFromState: Triggering change event on', element);
          }
          element.change();
          if (debug) {
            console.log('simplicityFromState: Triggered change event on', element);
          }
        }
      }
    });
  };
}(jQuery));
