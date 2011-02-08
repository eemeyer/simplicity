/**
 * @name $.ui.simplicitySlider
 * @namespace Slider bound to an input per handle.
 * <p>
 * Creates a progressive enhanced jQuery UI slider that is backed by one <code>input</code> element
 * per handle.
 * <p>
 * The widget options are passed through to the created slider. For more information see the
 * jQuery UI slider <a href="http://jqueryui.com/demos/slider/">documentation</a>.
 *
 * @example
 *   Single-handled slider
 *   &lt;input id="weight" name="w" />
 *   &lt;div id="weightSlider">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#weightSlider').simplicitySlider({
 *       input: '#weight',
 *       min: 0,
 *       max: 10,
 *       any: 0
 *     });
 *   &lt;/script>
 *
 * @example
 *   Double-handled slider
 *   &lt;input id="minPrice" name="minP" />
 *   &lt;input id="maxPrice" name="maxP" />
 *   &lt;div id="priceSlider">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#priceSlider').simplicitySlider({
 *       input: ['#minPrice', '#maxPrice'],
 *       min: 0,
 *       max: 100,
 *       values: [0, 100],
 *       any: [0, 100]
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicitySlider", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>input</dt>
     *   <dd>
     *     A single <code>input</code> or an array of two <code>input</code>s to associate the
     *     slider handles with.
     *   </dd>
     *   <dt>changeOnSlide</dt>
     *   <dd>
     *      Set this to <code>true</code> to cause <code>slide</code> events to change the
     *      bound <code>input</code>. Defaults to <code>false</code>.
     *   </dd>
     *   <dt>any</dt>
     *   <dd>
     *     Single value (or array of two values for a double-handled slider) which represents
     *     slider values that are mapped to the empty string (not selected). Usually one end
     *     of the slider acts in this manner.
     *   </dd>
     *   <dt>handleToInput</dt>
     *   <dd>
     *     Optional callback used to map the handle value to the <code>input</code> value.
     *   </dd>
     *   <dt>inputToHandle</dt>
     *   <dd>
     *     Optional callback used to map the <code>input</code> value to the handle value.
     *   </dd>
     *   <dt>sliderImpl</dt>
     *   <dd>
     *     Widget to use for the slider, defaults to <code>'slider'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicitySlider.options
     */
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
    /**
     * Event handler factory for the <code>change</code> event on an <code>input</code>
     * bound to a double-handled slider.
     * Updates the slider with the new value.
     *
     * @param valIdx
     *   The slider handle number. <code>0</code> for the left handle and <code>1</code> or the right one.
     * @name $.ui.simplicitySlider._inputValuesChangeHandlerFactory
     * @function
     * @private
     */
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
    /**
     * Event handler for the <code>change</code> event on an <code>input</code> bound to a
     * single-handled slider.
     * Updates the slider with the new value.
     *
     * @name $.ui.simplicitySlider._inputValueChangeHandler
     * @function
     * @private
     */
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
    /**
     * Event handler for the <code>slidechange</code> and <code>slide</code> events.
     * Updates the associated <code>input</code> elements with the new slider values.
     * <p>
     * This handler calls <code>change()</code> on the <code>input</code> elements
     * immediately after changing their values.
     *
     * @name $.ui.simplicitySlider._sliderChangeHandler
     * @function
     * @private
     */
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
