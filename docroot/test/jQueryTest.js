module('jQuery', {
  setup: function () {
    var events = [];
    this.eventRecorder = function (evt, ui) {
      events.push(this.name);
      return false;
    };
    this.events = events;
  }
});

test('bind $.proxy', function() {
  var element = $('<a href="#">link</a>').appendTo('#main');
  var proxy1 = $.proxy(this.eventRecorder, {'name': 'one'});
  var proxy2 = $.proxy(this.eventRecorder, {'name': 'two'});
  $(element).bind('click', proxy1);
  $(element).bind('click', proxy2);
  $(element).trigger('click');
  deepEqual(this.events, ['one', 'two'],
    'both handlers execute with different contexts');
});

test('unbind $.proxy', function() {
  var element = $('<a href="#">link</a>').appendTo('#main');
  var proxy1 = $.proxy(this.eventRecorder, {'name': 'one'});
  var proxy2 = $.proxy(this.eventRecorder, {'name': 'two'});
  $(element).bind('click', proxy1);
  $(element).bind('click', proxy2);
  $(element).unbind('click', proxy1);
  $(element).trigger('click');
  deepEqual(this.events, [],
    'neither handler executes due to a jQuery bug: http://bugs.jquery.com/ticket/9278');
});

test('unbind the target of $.proxy', function() {
  var element = $('<a href="#">link</a>').appendTo('#main');
  var proxy1 = $.proxy(this.eventRecorder, {'name': 'one'});
  var proxy2 = $.proxy(this.eventRecorder, {'name': 'two'});
  $(element).bind('click', proxy1);
  $(element).bind('click', proxy2);
  $(element).unbind('click', this._eventRecorder);
  $(element).trigger('click');
  deepEqual(this.events, [],
    'no proxied handlers execute');
});