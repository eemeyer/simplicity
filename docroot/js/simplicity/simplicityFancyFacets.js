/**
 * @name $.ui.simplicityFancyFacets
 * @namespace Composed variant of simplicityFancySelect with support for a flyout and selected area.
 *
 * A more complex extension of simplicityFancySelect that supports a flyout
 * for extra options as well as a selected area for the current selection.
 *
 * @example
 *   &lt;select id="mySelect" name="example">
 *     &lt;option value="1">one&lt;/option>
 *     &lt;option value="2">two&lt;/option>
 *     &lt;option value="3">three&lt;/option>
 *   &lt;select>
 *   &lt;div id="myFancy">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#myFancy')
 *       .simplicityFancyFacets({
 *         select: '#mySelect',
 *       })
 *      .hide();
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityFancyFacets", $.ui.simplicityWidget, {
     /**
     * Widget options.
     *
     * <dl>
     *   <dt>select</dt>
     *   <dd>
     *     Mandatory option that points to the <code>select</code> input to be enhanced. Can be a DOM node, jQuery node or selector.
     *   </dd>
     *   <dt>selectedArea</dt>
     *   <dd>
     *     When <code>true</code> causes selected options to appear in the selected area.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>availableContainsSelected</dt>
     *   <dd>
     *     When <code>true</code> causes selected options to appear in the available area.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>overflowContainsAvailable</dt>
     *   <dd>
     *     When <code>true</code> causes availble options to appear in the overflow area.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>overflowContainsSelected</dt>
     *   <dd>
     *     When <code>true</code> causes selected options to appear in the overflow area.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>availableLimit</dt>
     *   <dd>
     *     Determines how many options should appear in the available area. A negative number
     *     indicates no limit.
     *     Defaults to <code>5</code>.
     *   </dd>
     *   <dt>hideWhenEmpty</dt>
     *   <dd>
     *     When <code>true</code> the target element is hidden if the total number of
     *     options drops to zero and shown when it is larger.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>template</dt>
     *   <dd>
     *     When <code>''</code> falls back on the original DOM contents of the attached element.
     *     Replaces the contents otherwise.
     *     See source code for default value.
     *   </dd>
     *   <dt>availableTemplate</dt>
     *   <dd>
     *     The default template to use for the available facets block of <code>simplicityFancySelect</code>,
     *     (selector '.available-container'). Also acts as the default for <code>selectedTemplate</code>
     *     and <code>overflowTemplate</code>.
     *     <p>Default:</p>
     *     <pre>
     *&lt;ul class="options ui-helper-clearfix">
     *  &lt;li class="option ui-helper-clearfix">
     *    &lt;a href="#" class="label"/>
     *    &lt;span class="count"/>
     *  &lt;/li>
     *&lt;/ul></pre>
     *   </dd>
     *   <dt>selectedTemplate</dt>
     *   <dd>
     *     When <code>''</code> falls back to the value for option <code>availableTemplate</code>.
     *     Otherwise it determines the template to use for <code>simplicityFancySelect</code>
     *     when rendering the selected facets (selector '.selected-container'). Default is <code>''</code>.
     *   </dd>
     *   <dt>overflowTemplate</dt>
     *   <dd>
     *     When <code>''</code> falls back to the value for option <code>availableTemplate</code>.
     *     Otherwise it determines the template to use for <code>simplicityFancySelect</code>
     *     when rendering the overflow facets (selector '.overflow-container'). Default is <code>''</code>.
     *   </dd>
     *   <dt>pathTemplate</dt>
     *   <dd>
     *     When <code>''</code> falls back to the value for option <code>availableTemplate</code>.
     *     Otherwise it determines the template to use for <code>simplicityFancySelect</code>
     *     when rendering the facets navigation path (selector '.path-container'). Default is <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFancyFacets.options
     */
    options : {
      select: '',
      selectedArea: false,
      availableContainsSelected: true,
      overflowContainsAvailable: false,
      overflowContainsSelected: true,
      availableLimit: 5,
      hideWhenEmpty: false,
      template:
        '<div class="path-container"/>' +
        '<div class="selected-container"/>' +
        '<div class="available-container"/>' +
        '<div class="overflow-opener"><a href="#more">More&hellip;</a></div>' +
        '<div class="overflow-closer"><a href="#less">Less&hellip;</a></div>' +
        '<div class="overflow-flyout">' +
          '<div class="overflow-container"/>' +
          '<div class="overflow-closer">Less&hellip;</div>' +
        '</div>',
      availableTemplate: '' +
        '<ul class="options ui-helper-clearfix">' +
          '<li class="option ui-helper-clearfix">' +
            '<a href="#" class="label"/>' +
            '<span class="count"/>' +
          '</li>' +
        '</ul>',
      selectedTemplate: '',
      overflowTemplate: '',
      pathTemplate: ''
    },
    _create : function () {
      var select = $(this.options.select);
      if (select.length === 0 || !select.is('select')) {
        return;
      }
      this._addClass('ui-simplicity-fancy-facets');
      if (this.options.template !== '') {
        this.element.children().remove();
        $(this.options.template).appendTo(this.element);
      }
      this.element.find('.path-container')
        .simplicityFancySelect({
          select: select,
          firstPathOnly: true,
          firstPathSelections: true,
          hideWhenEmpty: true,
          template: this.options.pathTemplate || this.options.availableTemplate
        });
      this.element.find('.selected-container')
        .simplicityFancySelect({
          select: select,
          refreshOnCreate: false,
          ignorePath: true,
          firstPathSelections: true,
          template: this.options.selectedTemplate || this.options.availableTemplate
        });
      this.element.find('.available-container')
        .simplicityFancySelect({
          select: select,
          refreshOnCreate: false,
          ignorePath: true,
          firstPathSelections: true,
          template: this.options.overflowTemplate || this.options.availableTemplate
        });
      this.element.find('.overflow-container')
        .simplicityFancySelect({
          select: select,
          refreshOnCreate: false,
          ignorePath: true,
          firstPathSelections: true,
          template: this.options.availableTemplate
        });
      // This change handler must be bound *after* the contained widgets are
      // created so we can be sure it is called after their change handlers.
      this._bind(select, 'change', this._changeHandler);
      this.element.find('.overflow-flyout').simplicityFlyout();
      this._overflowOpen = false;
      var overflowOpener = this.element.find('.overflow-opener');
      var overflowCloser = this.element.find('.overflow-closer');
      overflowOpener.hide();
      overflowCloser.hide();
      this
        ._bind(overflowOpener, 'click', this._overflowOpenerHandler)
        ._bind(overflowCloser, 'click', this._overflowCloserHandler);
      this._applyOptions();
    },
    _changeHandler: function (evt) {
      if (this.options.hideWhenEmpty) {
        if (this.size() > 0) {
          this.element.show();
        } else {
          this.element.hide();
        }
      }
      var overflowOpener = this.element.find('.overflow-opener');
      var overflowCloser = this.element.find('.overflow-closer');
      if (this.element.find('.overflow-container').simplicityFancySelect('size') > 0) {
        overflowOpener.addClass('overflow-contains-selected');
        overflowCloser.addClass('overflow-contains-selected');
        if (!this._overflowOpen) {
          this.closeOverflow(true);
        }
      } else {
        overflowOpener.removeClass('overflow-contains-selected');
        overflowCloser.removeClass('overflow-contains-selected');
        this.closeOverflow(true);
      }
    },
    /**
     * Returns the target <code>select</code> input.
     *
     * @name $.ui.simplicityFancyFacets.select
     * @function
     */
    select: function () {
      return $(this.options.select);
    },
    /**
     * Returns the total number of options currently displayed.
     *
     * @name $.ui.simplicityFancyFacets.size
     * @function
     */
    size: function () {
      var size = 0;
      this.element.find('.path-container, .selected-container, .available-container, .overflow-container').each(function (idx, elem) {
        size += $(elem).simplicityFancySelect('size');
      });
      return size;
    },
    _overflowOpenerHandler: function (evt) {
      this.openOverflow();
      evt.preventDefault();
    },
    _overflowCloserHandler: function (evt) {
      this.closeOverflow();
      evt.preventDefault();
    },
    /**
     * Opens the overflow if it is closed.
     *
     * @name $.ui.simplicityFancyFacets.openOverflow
     * @function
     */
    openOverflow: function () {
      if (!this._overflowOpen) {
        this._overflowOpen = true;
        this.element.find('.overflow-opener').hide();
        this.element.find('.overflow-closer').show();
        this.element.find('.overflow-flyout').simplicityFlyout('open');
      }
    },
    /**
     * Closes the overflow if it is open.
     *
     * @name $.ui.simplicityFancyFacets.closeOverflow
     * @function
     */
    closeOverflow: function (force) {
      if (this._overflowOpen || force) {
        this._overflowOpen = false;
        var container = this.element.find('.overflow-container');
        var opener = this.element.find('.overflow-opener');
        var closer = this.element.find('.overflow-closer');
        if (container.simplicityFancySelect('size') > 0) {
          opener.show();
        } else {
          opener.hide();
        }
        closer.hide();
        this.element.find('.overflow-flyout').simplicityFlyout('close');
      }
    },
    _setOptions: function () {
      this._batchOptions = true;
      try {
        $.ui.simplicityWidget.prototype._setOptions.apply(this, arguments);
      } finally {
        this._batchOptions = false;
        this._applyOptions();
      }
    },
    _setOption: function (option, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if (!this._batchOptions) {
        this._applyOptions();
      }
    },
    _applyOptions: function () {
      this.element.find('.selected-container')
        .simplicityFancySelect('option', {
          displaySelected: true,
          displayUnselected: false,
          displayCount: this.options.selectedArea ? -1 : 0,
          skipCount: 0,
          hideWhenEmpty: true,
          template: this.options.selectedTemplate || this.options.availableTemplate
        });
      this.element.find('.available-container')
        .simplicityFancySelect({
          displaySelected: this.options.availableContainsSelected,
          displayUnselected: true,
          displayCount: this.options.availableLimit,
          skipCount: 0,
          template: this.options.availableTemplate
        });
      this.element.find('.overflow-container')
        .simplicityFancySelect({
          displaySelected: this.options.overflowContainsSelected,
          displayUnselected: true,
          displayCount: Number(this.options.availableLimit) === -1 ? 0 : -1,
          skipSelected: true,
          skipUnselected: true,
          skipCount: this.options.overflowContainsAvailable ? 0 : this.options.availableLimit,
          template: this.options.overflowTemplate || this.options.availableTemplate
        });
    },
    destroy: function () {
      this.element.children().remove();
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
