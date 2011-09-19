/**
 * @name $.ui.simplicitySelectSlider
 * @namespace Single handled slider bound to a select input.
 * <p>
 * Creates a progressive enhanced jQuery UI slider that is backed by a <code>select</code> input.
 * <p>
 * The widget options are passed through to the created slider. For more information see the
 * jQuery UI slider <a href="http://jqueryui.com/demos/slider/">documentation</a>.
 *
 * @example
 *   &lt;select id="weight" name="w">
 *     &lt;option value="l">Light&lt;/option>
 *     &lt;option value="m">Medium&lt;/option>
 *     &lt;option value="h">Heavy&lt;/option>
 *   &lt;select>
 *   &lt;div id="weightSlider">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#weightSlider').simplicitySelectSlider({
 *       select: '#weight'
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicitySelectSlider", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>select</dt>
     *   <dd>
     *     A single <code>select</code> input to associate the slider handle with.
     *   </dd>
     *   <dt>changeOnSlide</dt>
     *   <dd>
     *      Set this to <code>true</code> to cause <code>slide</code> events to change the
     *      bound <code>select</code> input. Defaults to <code>false</code>.
     *   </dd>
     *   <dt>showTicks</dt>
     *   <dd>
     *      Set this to <code>true</code> to cause the display of tick marks on the slider.
     *      Defaults to <code>true</code>.
     *   </dd>
     *   <dt>showLabels</dt>
     *   <dd>
     *     Set this to <code>true</code> to cause the display of labels under the tick marks
     *     of the slider. All labels are displayed, if you have too many labels then you
     *     will want to disable this option. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>centerLabels</dt>
     *   <dd>
     *     When labels are displayed this option causes their css to be adjusted to cause them
     *     to be centered around their tick mark. You would disable this if you had fixed width
     *     labels and wanted to fully control their position from css.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>justifyEndLabels</dt>
     *   <dd>
     *     When labels are displayed this option causes the first label to be left justified and
     *     the right label to be right justified with the ends of the slider. You would disable
     *     this if you had fixed width labels and wanted to fully control their position from css.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>showTooltip</dt>
     *   <dd>
     *     Set this to <code>true</code> to cause a tooltip to appear above the slider handle.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>centerTooltip</dt>
     *   <dd>
     *     When tooltip display is enabled this option causes the tooltip to be centered on
     *     the slider handle. You would disable this if you had a fixed width tooltip and wanted
     *     to fully control it's position from css.
     *     Defaults to <code>true</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicitySelectSlider.options
     */
    options : {
      select: '',
      changeOnSlide: false,
      showTicks: true,
      showLabels: true,
      centerLabels: true,
      justifyEndLabels: true,
      showTooltip: true,
      centerTooltip: true,
      scaleTemplate: '' +
        '<ol class="scale ui-helper-reset">' +
          '<li class="position">' +
            '<span class="label"></span>' +
            '<span class="tick ui-widget-content"></span>' +
          '</li>' +
        '</ol>',
      tooltipTemplate: '' +
        '<span class="tooltip ui-widget-content ui-corner-all">' +
          '<span class="tooltip-content"></span>' +
          '<span class="tooltip-pointer-down ui-widget-content">' +
            '<span class="tooltip-pointer-down-inner"></span>' +
          '</span>' +
        '</span>'
    },
    _create : function () {
      var select = $(this.options.select);
      if (select.length === 0 || !select.is('select')) {
        return;
      }
      this._addClass('ui-simplicity-select-slider ui-simplicity-slider');
      this.element.slider($.extend({
          min: 0,
          max: select.find('option').length - 1
        }, this.options));

      var scale = $(this.options.scaleTemplate);
      scale.find('.position').remove();
      this.element.append(scale);

      var tooltip = $(this.options.tooltipTemplate);
      if (!this.options.showTooltip) {
        tooltip.hide();
      }
      this.element.find('.ui-slider-handle').append(tooltip);

      this._bind('slidechange', this._sliderChangeHandler);
      this._bind('slide', this._sliderChangeHandler);
      if (this.options.changeOnSlide) {
      }
      this._bind(select, 'change', this._selectChangeHandler);
      this._refreshScale();
      this._refreshTooltip();
    },
    /**
    * Override of <code>_setOption</code> that is used to refresh the
    * slider tick marks, labels and tooltip when the assocaited options
    * are changed.
    *
    * @name $.ui.simplicitySelectSlider._setOption
    * @function
    * @private
    */
    _setOption: function (option, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      switch (option) {
      case 'showTicks':
      case 'showLabels':
      case 'centerLabels':
      case 'justifyEndLabels':
        this._refreshScale();
        break;
      case 'showTooltip':
      case 'centerTooltip':
        this._refreshTooltip();
        break;
      }
    },
    /**
     * Event handler for the <code>change</code> event on the <code>select</code> input.
     *
     * Updates the slider with the new value.
     *
     * @name $.ui.simplicitySelectSlider._selectChangeHandler
     * @function
     * @private
     */
    _selectChangeHandler: function (evt, ui) {
      if (!this._ignoreChangeEvent) {
        var changed = false;
        var max = $(this.options.select).find('option').length - 1;
        if (max !== this.element.slider('option', 'max')) {
          // The select input was dynamically changed, alter the accepted range of
          // values for the slider.
          this.element.slider('option', 'max', max);
          this._refreshScale();
          changed = true;
        }
        var value = evt.target.selectedIndex;
        if (changed || value !== this.element.slider('option', 'value')) {
          this.element.slider('option', 'value', value);
        }
      }
    },
    /**
     * Recreates the scale on the slider. This contains the tick marks and labels.
     * Tick marks and labels are created only if shown. Toggling the <code>showTicks</code>
     * or <code>showLabels</code> options will cause this method to be called and the
     * ticks or labels to be created.
     *
     * @name $.ui.simplicitySelectSlider._refreshScale
     * @function
     * @private
     */
    _refreshScale: function () {
      var scale = this.element.find('.scale');
      scale.find('.position').remove();
      var positionTemplate = $(this.options.scaleTemplate).find('.position').remove();
      if (positionTemplate.length) {
        var min = this.element.slider('option', 'min');
        var max = this.element.slider('option', 'max');
        for (var i = min; i <= max; i += 1) {
          var left = (i / (max - min) * 100).toFixed(2);
          var position = positionTemplate.clone()
            .addClass(i === min ? 'first' : i === max ? 'last' : '')
            .attr('style', 'left:' + left + '%');
          if (!this.options.showTicks) {
            position.find('.tick').hide();
          }
          var label = null;
          if (this.options.showLabels) {
            label = position.find('.label');
            var labelText = $(this.options.select).find('option:eq(' + i + ')').text();
            label.text(labelText);
          }
          scale.append(position);
          var center = this.options.centerLabels;
          var justify = this.options.justifyEndLabels;
          if (label !== null && (center || justify)) {
            if (justify && i === min) {
              // Do nothing.
            } else if (justify && i === max) {
              label.css('marginLeft', -label.width());
            } else if (center) {
              label.css('marginLeft', -label.width() / 2);
            }
          }
        }
      }
    },
    /**
     * Updates the content of the tooltip and hides or shows it as appropriate.
     *
     * @name $.ui.simplicitySelectSlider._refreshTooltip
     * @function
     * @private
     */
    _refreshTooltip: function (value) {
      var tooltip = this.element.find('.tooltip');
      if (tooltip.length) {
        if (!this.options.showTooltip) {
          tooltip.hide();
        }
        if ('undefined' === typeof value) {
          value = this.element.slider('value');
        }
        var label = $(this.options.select).find('option:eq(' + value + ')').text();
        tooltip.find('.tooltip-content').text(label);
        if (this.options.showTooltip && this.options.centerTooltip) {
          var left = -(tooltip.width() / 2) - 2;
          tooltip.css('marginLeft', left + 'px');
        }
        if (this.options.showTooltip) {
          tooltip.show();
        }
      }
    },
    /**
     * Event handler for the <code>slidechange</code> and <code>slide</code> events.
     * Updates the associated <code>select</code> input with the new slider value.
     * <p>
     * This handler calls <code>change()</code> on the <code>select</code> input
     * immediately after changing it's value.
     *
     * @name $.ui.simplicitySelectSlider._sliderChangeHandler
     * @function
     * @private
     */
    _sliderChangeHandler: function (evt, ui) {
      try {
        this._ignoreChangeEvent = true;
        var select = $(this.options.select)[0];
        var value = select.selectedIndex;
        var newVal = ui.value;
        if (value !== newVal) {
          select.selectedIndex = newVal;
        }
        this._refreshTooltip(newVal);
        if (evt.type !== 'slide' || this.options.changeOnSlide) {
          $(select).change();
        }
      } finally {
        this._ignoreChangeEvent = false;
      }
    },
    destroy: function () {
      this.element.slider('destroy');
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
