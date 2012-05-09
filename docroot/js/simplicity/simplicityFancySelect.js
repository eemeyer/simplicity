/**
 * @name $.ui.simplicityFancySelect
 * @namespace Progressively enhanced select.
 *
 * A progressive enhancement of a <code>select</code> input that maps the
 * <code>select</code> to  <code>ul</code> and each <code>option</code> to
 * a <code>li</code>. The template can be overriden to generate a different
 * mapping.
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
 *       .simplicityFancySelect({
 *         select: '#mySelect',
 *       })
 *      .hide();
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityFancySelect", $.ui.simplicityWidget, {
     /**
     * Widget options.
     *
     * <dl>
     *   <dt>select</dt>
     *   <dd>
     *     Mandatory option that points to the <code>select</code> input to be enhanced. Can be a DOM node, jQuery node or selector.
     *   </dd>
     *   <dt>displaySelected</dt>
     *   <dd>
     *     Determines whether selected options should be created and displayed.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>displayUnselected</dt>
     *   <dd>
     *     Determines whether unselected options should be created and displayed.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>displayCount</dt>
     *   <dd>
     *     When negative, displays and creates options with no limit. Acts as a limit to the number of
     *     created and display options otherwise. Can be thought of as the current page size.
     *     Defaults to <code>-1</code>.
     *   </dd>
     *   <dt>skipSelected</dt>
     *   <dd>
     *     When <code>skipCount</code> is greater than zero determines whether a selected option
     *     counts when tallying up the number of skipped options.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>skipUnselected</dt>
     *   <dd>
     *     When <code>skipCount</code> is greater than zero determines whether an unselected option
     *     counts when tallying up the number of skipped options.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>skipCount</dt>
     *   <dd>
     *     The number of options that should be skipped before the <code>displaySelected</code>
     *     and <code>displayUnselected</code> section is reached. Can be thought of as the
     *     starting positing of the current page.
     *     Defaults to <code>0</code>.
     *   </dd>
     *   <dt>firstPathOnly</dt>
     *   <dd>
     *     When <code>true</code> a single path is followed through the options. This is backed by the
     *     <code>is-path</code> data attribute on the <code>option</code> elements.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>ignorePath</dt>
     *   <dd>
     *     When <code>true</code> any path options (with the <code>is-path</code> data attribute set
     *     to <code>true</code>) will be ignored.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>firstPathSelections</dt>
     *   <dd>
     *     When <code>true</code> causes the click handler when deselecting an <code>option</code> which is
     *     considered a path (from the <code>is-path</code> data attribute) to alter the current selection
     *     to be all the options from the root to it's parent.
     *     <p>
     *     In other words, if the current selection is <code>Real Estate -> For Sale -> Condo</code> and 
     *     <code>For Sale</code> is deselected then the new selection would be <code>Real Estate</code>.
     *     <p>
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>refreshOnChange</dt>
     *   <dd>
     *     When <code>true</code> this widget repopulates itself whenever the target <code>select</code>
     *     input triggers a <code>change</code> event.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>refreshOnCreate</dt>
     *   <dd>
     *     When <code>true</code> this widget populates itself at creation. Exposed to allow for
     *     widgets that compose instances of this one.
     *     Defaults to <code>true</code>.
     *   </dd>
     *   <dt>hideWhenEmpty</dt>
     *   <dd>
     *     When <code>true</code> the target element is hidden if the number of created and displayed
     *     options drops to zero and shown when it is larger.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>checkableInputSelector</dt>
     *   <dd>
     *     Determines the selector (within the option template) to use to identify a checkable DOM input that reflects the current
     *     widget state. Defaults to <code>:checkbox.option-checkbox</code>.
     *   </dd>
     *   <dt>radioStyle</dt>
     *   <dd>
     *     Determines that the single select must always have a value selected, as would be the case for a radio button group.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>template</dt>
     *   <dd>
     *     When <code>''</code> falls back on the original DOM contents of the attached element.
     *     Replaces the contents otherwise.
     *     See source code for default value.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFancySelect.options
     */
    options : {
      select: '',
      displaySelected: true,
      displayUnselected: true,
      displayCount: -1,
      skipSelected: true,
      skipUnselected: true,
      skipCount: 0,
      firstPathOnly: false,
      ignorePath: false,
      firstPathSelections: false,
      refreshOnChange: true,
      refreshOnCreate: true,
      hideWhenEmpty: false,
      radioStyle: false,
      checkableInputSelector: ':checkbox.option-checkbox',
      template: '' +
        '<ul class="options ui-helper-clearfix">' +
          '<li class="option ui-helper-clearfix">' +
            '<a href="#" class="label"/>' +
            '<span class="count"/>' +
          '</li>' +
        '</ul>'
    },
    _create : function () {
      var select = $(this.options.select);
      if (select.length === 0 || !select.is('select')) {
        return;
      }
      this
        ._addClass('ui-simplicity-fancy-select')
        ._bind('click', this._clickHandler)
        ._bind(select, 'change', this._changeHandler);
      if (this.options.template !== '') {
        this.element.children().remove();
        $(this.options.template).appendTo(this.element);
      }
      var template = this.element.find('.option:first');
      if (template.length === 0) {
        template = $('<div class="option"/>');
      }
      this._optionTemplate = template.detach();
      this._checkableInputSelector = '';
      if (this.options.checkableInputSelector !== '') {
        if (this._optionTemplate.find(this.options.checkableInputSelector).length > 0) {
          this._checkableInputSelector = this.options.checkableInputSelector;
        }
      }
      if (this.options.refreshOnCreate) {
        this.refresh();
      }
    },
    _changeHandler: function () {
      if (!this._ignoreChange && this.options.refreshOnChange) {
        this.refresh();
      }
    },
    _setOptions: function () {
      this._dontRefresh = true;
      try {
        $.ui.simplicityWidget.prototype._setOptions.apply(this, arguments);
      } finally {
        this._dontRefresh = false;
      }
      this.refresh();
    },
    _setOption: function (option, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if (!this._dontRefresh) {
        this.refresh();
      }
    },
    /**
     * Recreates this widget based on the current <code>option</code> elements of the target
     * <code>select</code> input.
     *
     * @name $.ui.simplicityFancySelect.refresh
     * @function
     */
    refresh: function () {
      var target = this.element.find('.options:first');
      if (target.length === 0) {
        target = this.element;
      }
      target.children().remove();
      this._displayedCount = 0;
      var displayCount = Number(this.options.displayCount);
      var remainingToSkip = Number(this.options.skipCount);
      var firstPathOnly = this.options.firstPathOnly;
      var ignorePath = this.options.ignorePath;
      if (displayCount !== 0) {
        this.select().find('option').each($.proxy(function (idx, option) {
          var joption = $(option);
          if (joption.val() !== '') {
            var isPath = joption.data('is-path');
            if (firstPathOnly) {
              if (isPath) {
                target.append(this._createOption(this._optionTemplate, option));
                this._displayedCount += 1;
              } else {
                return false; // Stop iteration early
              }
            } else {
              var isSelected = option.selected;
              if (ignorePath && isPath) {
                // Ignore
              } else if (remainingToSkip > 0) {
                if ((isSelected && this.options.skipSelected) || (!isSelected && this.options.skipUnselected)) {
                  remainingToSkip -= 1;
                }
              } else {
                if ((isSelected && this.options.displaySelected) || (!isSelected && this.options.displayUnselected)) {
                  target.append(this._createOption(this._optionTemplate, option));
                  this._displayedCount += 1;
                  if (this._displayedCount === displayCount) {
                    return false; // Stop iteration early
                  }
                }
              }
            }
          }
        }, this));
      }
      if (this.options.hideWhenEmpty) {
        if (this._displayedCount === 0) {
          this.element.hide();
        } else {
          this.element.show();
        }
      }
    },
    /**
     * Returns the target <code>select</code> input.
     *
     * @name $.ui.simplicityFancySelect.select
     * @function
     */
    select: function () {
      return $(this.options.select);
    },
    /**
     * Returns the number of options currently displayed.
     *
     * @name $.ui.simplicityFancySelect.size
     * @function
     */
    size: function () {
      return this._displayedCount;
    },
    /**
     * Creates an option from the template. Adds <code>facet-id</code>, <code>is-path</code>
     * and <code>count</code> data attributes to the created element. Sets the label (<code>.label</code>)
     * and count (</code>.count</code>) to contained elements that match the appropriate class.
     * Triggers a <code>createOption</code> widget event (externally seen as <code>simplicityfancyfacetscreateoption</code>)
     * which can be used to customize the generated DOM element.
     *
     * @name $.ui.simplicityFancySelect._createOption
     * @function
     * @private
     */
    _createOption: function (template, option) {
      option = $(option);
      var isPath = option.data('is-path');
      var path = option.data('path');
      var count = option.data('count');
      var elem = template.clone()
        .data('facet-id', option.val())
        .data('is-path', 'undefined' !== typeof isPath ? isPath : false)
        .data('path', 'undefined' !== typeof path ? path : []);
      elem.find('.label').text(option.text());
      elem.find('.count').text('undefined' !== typeof count ? count : 0);
      var eventOptions = {
        target: elem,
        source: option,
        widget: this.element
      };
      this._trigger('createOption', {}, eventOptions);
      if ('undefined' !== eventOptions.target && null !== eventOptions.target) {
        elem = eventOptions.target;
      }
      this._markOptionSelected(elem, option[0].selected);
      return elem;
    },
    /**
     * Marks the given DOM node as either selected or unselected. Currently
     * toggles a <code>selected</code> class and looks for any contained
     * inputs (identified by selector <code>checkableInputSelector</code>) and
     * (un)checks them as appropriate.
     *
     * @name $.ui.simplicityFancySelect._markOptionSelected
     * @function
     * @private
     */
    _markOptionSelected: function (option, selected) {
      if (selected) {
        option.addClass('selected');
      } else {
        option.removeClass('selected');
      }
      if (this._checkableInputSelector !== '') {
        option.find(this._checkableInputSelector).each(function () {
          this.checked = selected;
        });
      }
    },
    _clickHandler: function (evt) {
      var option = $(evt.target);
      if (!option.is('.option')) {
        option = option.parentsUntil(this.element, '.option').first();
      }
      if (option.length !== 0) {
        var facetId = option.data('facet-id');
        var isPath = option.data('is-path');
        var select = this.select();
        var selected = select.val();
        var path = option.data('path');
        if ($.isArray(selected)) {
          var pos = $.inArray(facetId, selected);
          if (pos === -1) {
            // Multi select add
            selected.push(facetId);
            this._markOptionSelected(option, true);
          } else {
            // Multi select remove
            if (isPath && this.options.firstPathSelections) {
              selected.length = 0;
              $.each(path, function (idx, id) {
                selected.push(id);
              });
              this.element.find('.option')
                .each($.proxy(function (idx, elem) {
                  elem = $(elem);
                  var isSelected = $.inArray(elem.data('facet-id'), selected) !== -1;
                  this._markOptionSelected($(elem), isSelected);
                }, this));
            } else {
              selected.splice(pos, 1);
              this._markOptionSelected(option, false);
            }
          }
          this._markOptionSelected(option, pos === -1);
        } else if (selected !== facetId) {
          // Single select change
          if (selected !== null) {
            this.element.find('.option')
              .each($.proxy(function (idx, elem) {
                elem = $(elem);
                if (elem.data('facet-id') === selected) {
                  this._markOptionSelected($(elem), false);
                }
              }, this));
          }
          selected = facetId;
          this._markOptionSelected(option, true);
        } else if (!this.options.radioStyle) {
          // Single select clear
          if (isPath && this.options.firstPathSelections) {
            selected = path.length === 0 ? null : path[path.length - 1];
          } else {
            selected = null;
          }
          this._markOptionSelected(option, false);
        }
        select.val(selected);
        this._ignoreChange = true;
        try {
          select.change();
        } finally {
          this._ignoreChange = false;
        }
      }
      evt.preventDefault();
    }
  });
}(jQuery));
