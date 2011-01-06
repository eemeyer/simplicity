module("simplicityState");

test("get/set state", function() {
  expect(5);

  var stateElement = $('#state');
  stateElement.simplicityState();
  deepEqual(
      stateElement.simplicityState('state'),
      {},
      'Initial empty state');

  stateElement.simplicityState('state', {});
  deepEqual(
    stateElement.simplicityState('state'),
    {},
    'Do nothing update');

  stateElement.simplicityState('state', {a: 1});
  deepEqual(
    stateElement.simplicityState('state'),
    {a: 1},
    'Add a param');

  stateElement.simplicityState('state', {});
  deepEqual(
    stateElement.simplicityState('state'),
    {},
    'Remove a param');

  stateElement.simplicityState('state', {b: 2});
  deepEqual(
    stateElement.simplicityState('state'),
    {b: 2},
    'Add a different param');
});

test("event simplicityStateChange", function() {
  expect(8);

  var stateElement = $('#state');
  stateElement.simplicityState();

  var events = [];
  var eventRecordingHandler = function (event, state) {
    events.push({event: event, state: state});
  };
  stateElement.bind('simplicityStateChange', eventRecordingHandler);

  deepEqual(
      stateElement.simplicityState('state'),
      {},
      'Initial empty state');
  equal(0, events.length, 'No events on copyState');

  stateElement.simplicityState('state', {});
  equal(0, events.length, 'No events on state reset which does nothing');

  stateElement.simplicityState('state', {a: 1});
  equal(events.length, 1, 'One event on update');
  deepEqual(
      events[0].state,
      {a: 1},
      'One event on update');
  events.length = 0;

  stateElement.simplicityState('state', {a: 1});
  equal(events.length, 0, 'No events on update which causes sets value to same');
  events.length = 0;

  stateElement.simplicityState('state', {a: 2});
  equal(events.length, 1, 'One event on update which changes existing value');
  deepEqual(
      events[0].state,
      {a: 2},
      'One event on update which changes existing value');
  events.length = 0;
});

test("order of simplicityStateChange", function() {
  expect(4);

  var events = [];
  var eventRecordingHandler = function (event, state) {
    events.push({event: event, state: state});
  };

  var stateElement = $('#state');
  stateElement.simplicityState();
  stateElement.bind('simplicityStateChange', eventRecordingHandler);

  var state = {a: 1, z:2};
  stateElement.simplicityState('state', state);
  equal(events.length, 1, 'One event on initial setup');
  events.length = 0;

  delete state.a;
  state.a = 1;
  stateElement.simplicityState('state', state);
  equal(events.length, 0, 'No events on reorder');
  events.length = 0;

  state = {z: 2, a: 1};
  stateElement.simplicityState('state', state);
  equal(events.length, 0, 'No events on new with different order');
  events.length = 0;

  state.a = 2;
  stateElement.simplicityState('state', state);
  equal(events.length, 1, 'One event on final change');
  events.length = 0;
});

