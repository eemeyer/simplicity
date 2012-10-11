module("history", {
  setup: function() {
    History.replaceState({}, null, window.location.pathname);
  },
  teardown: function() {
    History.replaceState({}, null, window.location.pathname);
  }
});

test("enabled", function() {
  equal(History.enabled, true);
});


test("state empty", function() {
  deepEqual(History.getState().data, {});
});

test("replace state empty string", function() {
  History.replaceState({'a': ''}, null, '?a=');
  deepEqual(History.getState().data, {'a':''});
  });

test("replace state", function() {
  History.replaceState({'a': 1}, null, '?a=1');
  deepEqual(History.getState().data, {'a':1});
});

test("replace state array", function() {
  History.replaceState({'a': [1, 2]}, null, '?a=1&a=2');
  deepEqual(History.getState().data, {'a':[1,2]});
});

test("replace state different", function() {
  History.replaceState({'a': 1}, null, '?a=foo');
  deepEqual(History.getState().data, {'a':1});
});
