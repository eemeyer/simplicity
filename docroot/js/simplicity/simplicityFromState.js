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
