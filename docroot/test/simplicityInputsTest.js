module("simplicityInputs", {
  setup: function () {
    $(function () {
      $('#state').simplicityState({
        debug: false
      });
      $(':input').not('#state').simplicityInputs({
        stateElement: '#state'
      });
      $('#weightSlider').simplicitySlider({
        input: $('#weightInput'),
        min: 0,
        max: 30
      });
      $('#weightSliderCopy').simplicitySlider({
        input: $('#weightInputCopy'),
        min: 0,
        max: 30
      });
      $('#state').bind('simplicityStateChange', function (event, extra) {
        $('#state').text(JSON.stringify(extra, null, '  '));
      });
      $('#state').simplicityState('triggerChangeEvent');
    });
    this._squareCheckbox = $('#shape_square')[0];
    this._circleCheckbox = $('#shape_circle')[0];
    this._triangleCheckbox = $('#shape_triangle')[0];
    this._squareCheckboxCopy = $('#shape_square_copy')[0];
    this._circleCheckboxCopy = $('#shape_circle_copy')[0];
    this._triangleCheckboxCopy = $('#shape_triangle_copy')[0];
    this._shapeSelect = $('#shapeSelect')[0];
    this._shapeTextInput = $('#shapeTextInput')[0];
    this._shapeTextArea = $('#shapeTextArea')[0];
    this._shapeHiddenTextInput = $('#hiddenShapes')[0];
    equal(this._squareCheckbox.checked, false, 'Square is not checked on start');
    equal(this._circleCheckbox.checked, false, 'Circle is not checked on start');
    equal(this._triangleCheckbox.checked, false, 'Triangle is not checked on start');
    equal(this._squareCheckboxCopy.checked, false, 'Square copy is not checked on start');
    equal(this._circleCheckboxCopy.checked, false, 'Circle copy is not checked on start');
    equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy is not checked on start');
    equal($(this._shapeSelect).val(), null, 'Shape select empty on start');
    equal($(this._shapeTextInput).val(), '', 'Shape text input empty on start');
    equal($(this._shapeTextArea).val(), '', 'Shape text area empty on start');
    equal($(this._shapeHiddenTextInput).val(), '', 'Shape hidden input empty on start');
    deepEqual(
        $('#state').simplicityState('state'),
        {},
        'State is empty on start');
  }
});

test("simplicityInputs toggle single checkbox", function() {
  //expect(55);

  this._squareCheckbox.checked = true;
  equal(this._squareCheckbox.checked, true, 'Check square');
  equal(this._circleCheckbox.checked, false, 'Circle remains unchecked');
  equal(this._triangleCheckbox.checked, false, 'Triangle remains unchecked');
  equal(this._squareCheckboxCopy.checked, false, 'Square copy remains unchecked');
  equal(this._circleCheckboxCopy.checked, false, 'Circle copy remains unchecked');
  equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy remains unchecked');
  equal($(this._shapeSelect).val(), null, 'Shape select remains empty');
  equal($(this._shapeTextInput).val(), '', 'Shape text input remains empty');
  equal($(this._shapeTextArea).val(), '', 'Shape text area remains empty');
  equal($(this._shapeHiddenTextInput).val(), '', 'Shape hidden input remains empty');
  deepEqual(
      $('#state').simplicityState('state'),
      {},
      'Empty state');

  $(this._squareCheckbox).change();
  equal(this._squareCheckbox.checked, true, 'Fire change event on square');
  equal(this._circleCheckbox.checked, false, 'Circle remains unchecked');
  equal(this._triangleCheckbox.checked, false, 'Triangle remains unchecked');
  equal(this._squareCheckboxCopy.checked, true, 'Square copy is now checked');
  equal(this._circleCheckboxCopy.checked, false, 'Circle copy remains unchecked');
  equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy remains unchecked');
  deepEqual($(this._shapeSelect).val(), ['square'], 'Shape select now contains square');
  equal($(this._shapeTextInput).val(), 'square', 'Shape text input now contains square');
  equal($(this._shapeTextArea).val(), 'square', 'Shape text area now contains square');
  equal($(this._shapeHiddenTextInput).val(), 'square', 'Shape hidden input now contains square');
  deepEqual(
      $('#state').simplicityState('state'),
      {shape: 'square'},
      'State contains square');

  this._squareCheckbox.checked = false;
  equal(this._squareCheckbox.checked, false, 'Uncheck square');
  equal(this._circleCheckbox.checked, false, 'Circle remains unchecked');
  equal(this._triangleCheckbox.checked, false, 'Triangle remains unchecked');
  equal(this._squareCheckboxCopy.checked, true, 'Square copy is still checked');
  equal(this._circleCheckboxCopy.checked, false, 'Circle copy remains unchecked');
  equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy remains unchecked');
  deepEqual($(this._shapeSelect).val(), ['square'], 'Shape select still contains square');
  equal($(this._shapeTextInput).val(), 'square', 'Shape text input still contains square');
  equal($(this._shapeTextArea).val(), 'square', 'Shape text area still contains square');
  equal($(this._shapeHiddenTextInput).val(), 'square', 'Shape hidden input still contains square');
  deepEqual(
      $('#state').simplicityState('state'),
      {shape: 'square'},
      'State still contains square');

  $(this._squareCheckbox).change();
  equal(this._squareCheckbox.checked, false, 'Fire change event on square');
  equal(this._squareCheckboxCopy.checked, false, 'Square copy is now unchecked');
  equal(this._circleCheckbox.checked, false, 'Circle remains unchecked');
  equal(this._triangleCheckbox.checked, false, 'Triangle remains unchecked');
  equal(this._circleCheckboxCopy.checked, false, 'Circle copy remains unchecked');
  equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy remains unchecked');
  equal($(this._shapeSelect).val(), null, 'Shape select is now empty');
  equal($(this._shapeTextInput).val(), '', 'Shape text input is now empty');
  equal($(this._shapeTextArea).val(), '', 'Shape text area is now empty');
  equal($(this._shapeHiddenTextInput).val(), '', 'Shape hidden input is now empty');
  deepEqual(
      $('#state').simplicityState('state'),
      {},
      'State is now empty');
});

test("simplicityInputs toggle multiple checkboxes", function() {
  expect(44);
  this._circleCheckbox.checked = true;
  $(this._circleCheckbox).change();
  equal(this._squareCheckbox.checked, false, 'Check and change circle');
  equal(this._circleCheckbox.checked, true, 'Circle is now checked');
  equal(this._triangleCheckbox.checked, false, 'Triangle remains unchecked');
  equal(this._squareCheckboxCopy.checked, false, 'Square copy remains unchecked');
  equal(this._circleCheckboxCopy.checked, true, 'Circle copy is now checked');
  equal(this._triangleCheckboxCopy.checked, false, 'Triangle copy remains unchecked');
  deepEqual($(this._shapeSelect).val(), ['circle'], 'Shape select is now circle');
  equal($(this._shapeTextInput).val(), 'circle', 'Shape text input is now circle');
  equal($(this._shapeTextArea).val(), 'circle', 'Shape text area is now circle');
  equal($(this._shapeHiddenTextInput).val(), 'circle', 'Shape hidden input is now circle');
  deepEqual(
      $('#state').simplicityState('state'),
      {shape: 'circle'},
      'State now contains circle');

  this._triangleCheckbox.checked = true;
  $(this._triangleCheckbox).change();
  equal(this._squareCheckbox.checked, false, 'Check and change triangle');
  equal(this._circleCheckbox.checked, true, 'Circle is still checked');
  equal(this._triangleCheckbox.checked, true, 'Triangle is now checked');
  equal(this._squareCheckboxCopy.checked, false, 'Square copy remains unchecked');
  equal(this._circleCheckboxCopy.checked, true, 'Circle copy is now checked');
  equal(this._triangleCheckboxCopy.checked, true, 'Triangle is now checked');
  deepEqual($(this._shapeSelect).val(), ['circle', 'triangle'], 'Shape select now includes triangle');
  equal($(this._shapeTextInput).val(), 'circle,triangle', 'Shape text input now includes triangle');
  equal($(this._shapeTextArea).val(), 'circle,triangle', 'Shape text area now includes triangle');
  equal($(this._shapeHiddenTextInput).val(), 'circle,triangle', 'Shape hidden input now includes triangle');
  deepEqual(
      $('#state').simplicityState('state'),
      {shape: ['circle', 'triangle']},
      'State now includes triangle');

  this._circleCheckbox.checked = false;
  $(this._circleCheckbox).change();
  equal(this._squareCheckbox.checked, false, 'Uncheck and change circle');
  equal(this._circleCheckbox.checked, false, 'Circle is now unchecked');
  equal(this._triangleCheckbox.checked, true, 'Triangle remains checked');
  equal(this._squareCheckboxCopy.checked, false, 'Square copy remains unchecked');
  equal(this._circleCheckboxCopy.checked, false, 'Circle copy is now unchecked');
  equal(this._triangleCheckboxCopy.checked, true, 'Triangle remains checked');
  deepEqual($(this._shapeSelect).val(), [ 'triangle'], 'Shape select no longer includes circle');
  equal($(this._shapeTextInput).val(), 'triangle', 'Shape text input no longer includes circle');
  equal($(this._shapeTextArea).val(), 'triangle', 'Shape text area no longer includes circle');
  equal($(this._shapeHiddenTextInput).val(), 'triangle', 'Shape hidden no longer includes circle');
  deepEqual(
      $('#state').simplicityState('state'),
      {shape: 'triangle'},
      'State no longer includes circle');
});
