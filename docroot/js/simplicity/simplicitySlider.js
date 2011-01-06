/**
 * @name $.ui.simplicitySlider
 * @namespace Slider bound to an input per handle
 */
(function ($) {
  $.widget("ui.simplicitySlider", {
    options : {
      input: [],
      changeOnSlide: false,
      any: [],
      handleToInput: '',
      inputToHandle: '',
      sliderImpl: 'slider'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-slider');
      if (this.options.sliderImpl !== '') {
        this.element[this.options.sliderImpl](this.options);
      }
      this.element.bind('slidechange', $.proxy(this._sliderChangeHandler, this));
      if (this.options.changeOnSlide) {
        this.element.bind('slide', $.proxy(this._sliderChangeHandler, this));
      }
      this._inputMinChangeHandler = this._inputValuesChangeHandlerFactory(0);
      this._inputMaxChangeHandler = this._inputValuesChangeHandlerFactory(1);
      if ($.isArray(this.options.input)) {
        $(this.options.input[0]).bind('change', $.proxy(this._inputMinChangeHandler, this));
        $(this.options.input[1]).bind('change', $.proxy(this._inputMaxChangeHandler, this));
        $(this.options.input[0]).each($.proxy(function (i, elem) {
          this._inputMinChangeHandler.call(this, {target: elem});
        }, this));
        $(this.options.input[1]).each($.proxy(function (i, elem) {
          this._inputMaxChangeHandler.call(this, {target: elem});
        }, this));
      } else {
        $(this.options.input).bind('change', $.proxy(this._inputValueChangeHandler, this));
        $(this.options.input).each($.proxy(function (i, elem) {
          this._inputValueChangeHandler.call(this, {target: elem});
        }, this));
      }
    },
    // Double handled slider
    _inputValuesChangeHandlerFactory: function (valIdx) {
      return $.proxy(function (evt, ui) {
        if (!this._ignoreChangeEvent) {
          var values = this.element.slider('option', 'values');
          var newValue = $(evt.target).val();
          if (String(newValue) === '') {
            newValue = this.options.any[valIdx];
          } else if ($.isFunction(this.options.inputToHandle)) {
            newValue = this.options.inputToHandle(newValue);
          }
          if (values[valIdx] !== newValue) {
            values[valIdx] = newValue;
            this.element.slider('option', 'values', values);
          }
        }
      }, this);
    },
    // Single handled slider;
    _inputValueChangeHandler: function (evt, ui) {
      if (!this._ignoreChangeEvent) {
        var value = this.element.slider('option', 'value');
        var newValue = $(evt.target).val();
        if (String(newValue) === '') {
          newValue = this.options.any || '';
        }
        if (value !== newValue) {
          this.element.slider('option', 'value', newValue);
        }
      }
    },
    _sliderChangeHandler: function (evt, ui) {
      try {
        this._ignoreChangeEvent = true;
        var inputs = this.options.input;
        var anys = this.options.any;
        var values;
        if ($.isArray(inputs)) {
          // Double handled slider
          values = this.element.slider('option', 'values');
        } else {
          // Single handled slider
          inputs = [inputs];
          anys = [anys];
          values = [this.element.slider('option', 'value')];
        }
        $.each(inputs, $.proxy(function (idx, elem) {
          var newVal = values[idx];
          if (String(anys[idx]) === String(newVal)) {
            newVal = '';
          } else if ($.isFunction(this.options.handleToInput)) {
            newVal = this.options.handleToInput(newVal);
          }
          if (String($(elem).val()) !== String(newVal)) {
            $(elem).val(newVal);
            $(elem).change();
          }
        }, this));
      } finally {
        this._ignoreChangeEvent = false;
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-slider');
      if ($.isArray(this.options.input)) {
        $(this.options.input[0]).unbind('change', this._inputMinChangeHandler);
        $(this.options.input[1]).unbind('change', this._inputMaxChangeHandler);
      } else {
        $(this.options.input).unbind('change', this._inputValueChangeHandler);
      }
      this.element.unbind('change', this._sliderChangeHandler);
      this.element.unbind('slide', this._sliderChangeHandler);
      if (this.options.sliderImpl !== '') {
        this.element[this.options.sliderImpl]('destroy');
      }
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
