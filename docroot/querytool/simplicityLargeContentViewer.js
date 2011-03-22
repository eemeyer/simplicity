// Based on slick.editors.js LongTextCellEditor

function simplicityLargeContentViewer(args) {
  var $input, $wrapper;
  var defaultValue;
  var scope = this;

  this.init = function () {
    var $container = $("body");

    $wrapper = $(
        "<div style='z-index:10000;position:absolute;background:white;padding:5px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;'/>")
        .appendTo($container);

    $input = $(
        "<textarea disabled='disabled' hidefocus rows=5 style='backround:white;width:250px;height:80px;border:0;outline:0'/>")
        .appendTo($wrapper);

    $("<div style='text-align:right'><button>Close</button></div>")
        .appendTo($wrapper);

    $wrapper.find("button:first").bind("click", this.cancel);
    $input.bind("keydown", this.handleKeyDown);

    scope.position(args.position);
    $input.focus().select();
  };

  this.handleKeyDown = function (e) {
    if (e.which === $.ui.keyCode.ESCAPE) {
      e.preventDefault();
      scope.cancel();
    } else if (e.which === $.ui.keyCode.TAB && e.shiftKey) {
      e.preventDefault();
      grid.navigatePrev();
    } else if (e.which === $.ui.keyCode.TAB) {
      e.preventDefault();
      grid.navigateNext();
    }
  };

  this.cancel = function () {
    $input.val(defaultValue);
    args.cancelChanges();
  };

  this.hide = function () {
    $wrapper.hide();
  };

  this.show = function () {
    $wrapper.show();
  };

  this.position = function (position) {
    $wrapper.css('top', position.top - 5).css('left', position.left - 5);
  };

  this.destroy = function () {
    $wrapper.remove();
  };

  this.focus = function () {
    $input.focus();
  };

  this.loadValue = function (item) {
    $input.val(defaultValue = item[args.column.field]);
    $input.select();
  };

  this.serializeValue = function () {
    return item[args.column.field];
  };

  this.isValueChanged = function () {
    return false;
  };

  this.validate = function () {
    return {
      valid : true,
      msg : null
    };
  };

  this.init();
}
