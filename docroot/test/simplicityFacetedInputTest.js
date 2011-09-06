module("simplicityFacetedInput", {
  setup: function () {
    $('<div id="state"/>').simplicityState().appendTo('#main');
  }
});

test("checkbox basic", function() {
  expect(14);
  var content = $('<div><label for="myInput">My Label</label><input id="myInput" type="checkbox" name="q" value="foo"></div>')
    .appendTo('#main');
  var input = content.find('input');
  equal(input.hasClass('ui-simplicity-faceted-input'), false);
  equal(input.hasClass('ui-simplicity-inputs'), false);
  equal(content.find('span.count').length, 0);
  
  input.simplicityFacetedInput({
    stateElement: '#state',
    searchElement: '#main',
    template: '<span class="myCountClass"/>',
    facetsKey: 'q'
  });
  equal(input.hasClass('ui-simplicity-faceted-input'), true);
  equal(input.hasClass('ui-simplicity-inputs'), true);
  equal(input[0].checked, false);
  equal(content.find('span.myCountClass').length, 1);
  equal(content.find('span.myCountClass').text(), '');
  
  $('#state').simplicityState('state', {'q': 'foo'});
  equal(input[0].checked, true);
  equal(content.find('span.myCountClass').length, 1);
  equal(content.find('span.myCountClass').text(), '');

  $('#main').triggerHandler('simplicitySearchResponse', {
    drillDown: {
      'q': {
        'exact': {
          'foo': 23
        }
      }
    }
  });
  equal(input[0].checked, true);
  equal(content.find('span.myCountClass').length, 1);
  equal(content.find('span.myCountClass').text(), '23');
});

test("select basic", function() {
  expect(12);
  var content = $('<select name="q"><option value="1">first</option><option value="2">second</option></select')
    .appendTo('#main');
  var option1 = $(content.find('option')[0]);
  var option2 = $(content.find('option')[1]);
  equal(content.hasClass('ui-simplicity-faceted-input'), false);
  equal(content.hasClass('ui-simplicity-inputs'), false);
  equal(content.val(), '1');

  content.simplicityFacetedInput({
    stateElement: '#state',
    searchElement: '#main',
    facetsKey: 'q'
  });
  equal(content.hasClass('ui-simplicity-faceted-input'), true);
  equal(content.hasClass('ui-simplicity-inputs'), true);
  equal(content.val(), '1');

  $('#state').simplicityState('state', {'q': '2'});
  equal(content.val(), '2');
  equal(option1.text(), 'first');
  equal(option2.text(), 'second');

  $('#main').triggerHandler('simplicitySearchResponse', {
    drillDown: {
      'q': {
        'exact': {
          '1': 23,
          '2': 45
        }
      }
    }
  });
  equal(content.val(), '2');
  equal(option1.text(), 'first 23');
  equal(option2.text(), 'second 45');
});

test("lifecycle basic", function() {
  expect(30);
  var content1 = $('<div><label for="myInput">My Label</label><input id="myInput" type="checkbox" name="q" value="foo"></div>')
    .appendTo('#main');
  var content2 = $('<div><label for="otherInput">Other Label</label><input id="otherInput" type="checkbox" name="q" value="bar"></div>')
    .appendTo('#main');
  var input1 = content1.find('#myInput');
  var input2 = content2.find('#otherInput');
  $([input1, input2]).simplicityFacetedInput({
    stateElement: '#state',
    searchElement: '#main',
    template: '<span class="myCountClass"/>',
    facetsKey: 'q'
  });
  $('#state').simplicityState('state', {'q': 'bar'});
  $('#main').triggerHandler('simplicitySearchResponse', {
    drillDown: {
      'q': {
        'exact': {
          'foo': 23,
          'bar': 45
        }
      }
    }
  });
  equal(input1.hasClass('ui-simplicity-faceted-input'), true);
  equal(input1.hasClass('ui-simplicity-inputs'), true);
  equal(input2.hasClass('ui-simplicity-faceted-input'), true);
  equal(input2.hasClass('ui-simplicity-inputs'), true);
  equal(input1[0].checked, false);
  equal(input2[0].checked, true);
  equal(content1.find('span.myCountClass').length, 1);
  equal(content1.find('span.myCountClass').text(), '23');
  equal(content2.find('span.myCountClass').length, 1);
  equal(content2.find('span.myCountClass').text(), '45');

  content2.remove();
  equal(input1.hasClass('ui-simplicity-faceted-input'), true);
  equal(input1.hasClass('ui-simplicity-inputs'), true);
  equal(input2.hasClass('ui-simplicity-faceted-input'), false);
  equal(input2.hasClass('ui-simplicity-inputs'), false);
  equal(input1[0].checked, false);
  equal(input2[0].checked, true);
  equal(content1.find('span.myCountClass').length, 1);
  equal(content1.find('span.myCountClass').text(), '23');
  equal(content2.find('span.myCountClass').length, 1);
  equal(content2.find('span.myCountClass').text(), '45');

  $('#state').simplicityState('state', {'q': 'foo'});
  $('#main').triggerHandler('simplicitySearchResponse', {
    drillDown: {
      'q': {
        'exact': {
          'foo': 67,
          'bar': 89
        }
      }
    }
  });
  equal(input1.hasClass('ui-simplicity-faceted-input'), true);
  equal(input1.hasClass('ui-simplicity-inputs'), true);
  equal(input2.hasClass('ui-simplicity-faceted-input'), false);
  equal(input2.hasClass('ui-simplicity-inputs'), false);
  equal(input1[0].checked, true);
  equal(input2[0].checked, true, 'input2 should remain checked as it is no longer a widget');
  equal(content1.find('span.myCountClass').length, 1);
  equal(content1.find('span.myCountClass').text(), '67');
  equal(content2.find('span.myCountClass').length, 1);
  equal(content2.find('span.myCountClass').text(), '45', 'input2 should have the same count as before as it is no longer a widget');
});
