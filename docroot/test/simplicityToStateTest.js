module("simplicityToState");

test("single select with default option", function() {
  expect(6);

  var input = $('' +
    '<select name="test">' +
    '  <option value="">Select...</option>' +
    '  <option value="1">one</option>' +
    '  <option value="2">two</option>' +
    '  <option value="3">three</option>' +
    '</select>')
    .appendTo('#main');

  var state;
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {},
    'Initial empty state');

  $(input).val('1');
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {
      test: '1'
    },
    'Select 1');

  $(input).val('');
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {},
    'Select "Select..."');

  $(input).val('2');
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {
      test: '2'
    },
    'Select 2');

    $(input)[0].selectedIndex = -1;
    $(input).simplicityToState(state = {});
    deepEqual(
      state,
      {},
      'Select "Select..."');

    $(input).val('3');
    $(input).simplicityToState(state = {});
    deepEqual(
      state,
      {
        test: '3'
      },
      'Select 3');
});

test("multi select with default option", function() {
  expect(4);

  var input = $('' +
    '<select name="test" multiple="multiple">' +
    '  <option value="">Select...</option>' +
    '  <option value="1">one</option>' +
    '  <option value="2">two</option>' +
    '  <option value="3">three</option>' +
    '</select>')
    .appendTo('#main');

  var state;
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {},
    'Initial empty state');

  $(input).val([1,3]);
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {
      test: ['1', '3']
    },
    'Select 1 and 3');

  $(input).val(['']);
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {},
    'Select "Select..."');

  $(input).val(['', '1', '2', '3']);
  $(input).simplicityToState(state = {});
  deepEqual(
    state,
    {
      test: ['1', '2', '3']
    },
    'Select "Select...", 1, 2 and 3');
});
