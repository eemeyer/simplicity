/**
 * @name $.ui.simplicityFacetedSelect
 * @namespace Dynamically populates the <code>option</code> elements in a <code>select</code> based on the facet response from the controller.
 * <p>
 * Listens to <code>simplicitySearchResponse</code> events and uses the facet output to update the
 * available <code>option</code> elements in the wrapped <code>select</code>.
 * <p>
 * Has special support for handling <code>option</code> elements with no value.
 *
 * @example
 *   &lt;select id="category" name="cat">
 *     &lt;option value="">Select...&lt;/option>
 *   &lt;select>
 *   &lt;script type="text/javascript">
 *     $('#category').simplicityFacetedSelect();
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityFacetedSelect", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>facetsKey</dt>
     *   <dd>
     *     The key used in the facets request to identify the facets data.
     *     Defaults to the name attribute of the <code>select</code> element.
     *   </dd>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The location of the simplicityDiscoverySearch widget.
     *     Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>optionTemplate</dt>
     *   <dd>
     *     Template used when <code>optionFormatter</code> is not set.
     *     Bracketed text will be replaced by it's mapped value,
     *     unknown variables and other text will remain as is.
     *     Defaults to <code>'{option}'</code>.
     *     <p>
     *     Supported substitutions:
     *     <dl>
     *       <dt><code>{option}</code></dt>
     *       <dd>The label for the facet. If no label is available then this is the id.</dd>
     *       <dt><code>{count}</code></dt>
     *       <dd>The count for the facet, if available. If not available defaults to
     *           the value of the <code>missingCount</code> option.</dd>
     *     </dl>
     *   </dd>
     *   <dt>missingCount</dt>
     *   <dd>
     *     Used during template substitution for facets that have no count.
     *     Defaults to <code>'?'</code>.
     *   </dd>
     *   <dt>optionFormatter</dt>
     *   <dd>
     *     Optional callback function that can be used to customize the label for each facet.
     *     Gets called with a single argument that is an dictionary containing <code>id</code>
     *     and <code>facet</code> entries. The <code>facet</code> entry consists of the returned
     *     data for the facet from the <code>simplicitySearchResponse</code> event.
     *   </dd>
     *   <dt>nextResponseOnly</dt>
     *   <dd>
     *     Option that causes the dynamic <code>option</code> population to trigger for the
     *     next <code>simplicitySearchResponse<code> event that contains facet data for the
     *     configured facet.
     *     Defaults to <code>false</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFacetedSelect.options
     */
    options: {
      facetsKey: '',
      searchElement: 'body',
      optionTemplate: '{option}',
      missingCount: '?',
      optionFormatter: '',
      nextResponseOnly: false
    },
    _create: function () {
      if (!this.element.is('select')) {
        return;
      }
      this._frozen = false;
      this
        ._addClass('ui-simplicity-faceted-select')
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler);
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event.
     * Calls <code>refresh</code> while respecting the <code>nextResponseOnly</code>
     * option.
     *
     * @name $.ui.simplicityFacetedSelect._searchResponseHandler
     * @function
     * @private
     */
    _searchResponseHandler: function (evt, ui) {
      if (!this._frozen) {
        var refreshed = this.refresh(ui);
        if (this.options.nextResponseOnly && refreshed) {
          this._frozen = true;
        }
      }
    },
    /**
     * Override of <code>_setOption</code> that is used to ensure that the
     * <code>nextResponseOnly</code> option works as expected when changed.
     *
     * @name $.ui.simplicityFacetedSelect._setOption
     * @function
     * @private
     */
    _setOption: function (option, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if ('nextResponseOnly' === option) {
        this._frozen = false;
      }
    },
    /**
     * Recreates the <code>option</code> elements in the wrapped <code>select</code>
     * taking care to preserve the current selection.
     * option.
     *
     * @param ui
     *   The <code>simplicitySearchResponse</code> payload.
     *
     * @name $.ui.simplicityFacetedSelect.refresh
     * @function
     * @private
     */
    refresh: function (ui) {
      var refreshed = false;
      if (ui && ui._discovery && ui._discovery.response && ui._discovery.response.facets) {
        var facetsKey = this.options.facetsKey || this.element.attr('name');
        var facets = ui._discovery.response.facets[facetsKey];
        if (facets) {
          var selected = this.element.val();
          this.element.find('option[value!=""]').remove();
          if ($.isArray(facets.ids) && facets.data) {
            $.each(facets.ids, $.proxy(function (idx, id) {
              var facet = facets.data[id] || {};
              var text;
              if ($.isFunction(this.options.optionFormatter)) {
                text = this.options.optionFormatter.call(this, {
                  id: id,
                  facet: facet
                });
              } else {
                text = this.options.optionTemplate
                  .replace(/\{option\}/g, facet.label || id)
                  .replace(/\{count\}/g, 'undefined' !== typeof facet.count ? facet.count : this.options.missingCount);
              }
              $('<option/>')
                .val(id)
                .text(text)
                .appendTo(this.element);
            }, this));
          }
          if (selected !== null) {
            this.element.val(selected);
          }
          this.element.change();
          refreshed = true;
        }
      }
      return refreshed;
    }
  });
}(jQuery));
