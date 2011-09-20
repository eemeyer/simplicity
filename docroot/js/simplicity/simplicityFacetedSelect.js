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
     *     Gets called with a single argument that is a dictionary containing <code>id</code>
     *     and <code>facet</code> entries. The <code>facet</code> entry consists of the returned
     *     data for the facet from the <code>simplicitySearchResponse</code> event.
     *   </dd>
     *   <dt>indent</dt>
     *   <dd>
     *     If set to a non-empty string, then this will be used as a leading indentation for each level of descendant facets.
     *     Note that actual whitespace characters are not rendered by most browsers.
     *     Setting to an empty string results in no indentation being applied for descendant facets.
     *     Defaults to <code>''</code>.
     *   </dd>
     *   <dt>maxDepth</dt>
     *   <dd>
     *     Option to control the maximum tree depth displayed. Setting this to a positive number causes the maximum
     *     depth to be that value. Setting this to <code>-1</code> makes the maximum depth unlimited and setting it to
     *     <code>0</code> causes no facets to be added.
     *   </dd>
     *   <dt>nextResponseOnly</dt>
     *   <dd>
     *     Option that causes the dynamic <code>option</code> population to trigger for the
     *     next <code>simplicitySearchResponse</code> event that contains facet data for the
     *     configured facet.
     *     Defaults to <code>false</code>.
     *   </dd>
     *   <dt>firstPathOnly</dt>
     *   <dd>
     *     Option that causes the dynamic <code>option</code> population to follow only the first
     *     selected path through the hierarchy of available facets.
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
      indent: '',
      maxDepth: -1,
      nextResponseOnly: false,
      firstPathOnly: false
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
        if ('undefined' !== typeof facets) {
          var selected = this.element.val();
          this.element.find('option[value!=""]').remove();
          if ('undefined' !== typeof facets.data) {
            this._addFacets(facets.data, facets, 1, this.options.maxDepth);
          }
          if (selected !== null) {
            this.element.val(selected);
          }
          this.element.change();
          refreshed = true;
        }
      }
      return refreshed;
    },
    _addFacets: function (data, facet, depth, maxDepth) {
      if ('undefined' !== typeof facet) {
        var firstPathOnly = this.options.firstPathOnly;
        var hasNavIds = $.isArray(facet.navIds);
        var hasChildIds = $.isArray(facet.childIds);
        if ((maxDepth === -1 || depth <= maxDepth) && (hasNavIds || hasChildIds)) {
          var navAdded = {};
          if (firstPathOnly) {
            if (hasNavIds && facet.navIds.length === 1) {
              pathFacet = data[facet.navIds[0]];
              if (pathFacet && $.isArray(pathFacet.childIds)) {
                // Part of a path, ignore all other branches
                this._addFacet(data, facet.navIds[0], depth, maxDepth, true);
                hasChildIds = false;
                hasNavIds = false;
              }
            } else {
              // Possible multiple subtrees, stop any further recursion
              maxDepth = depth;
            }
          }
          if (hasNavIds) {
            $.each(facet.navIds, function (idx, id) {
              navAdded[id] = false;
            });
          }
          if (hasChildIds) {
            $.each(facet.childIds, $.proxy(function (idx, id) {
              this._addFacet(data, id, depth, firstPathOnly ? depth : maxDepth, false);
              if (hasNavIds && navAdded[id] === false) {
                navAdded[id] = true;
              }
            }, this));
          }
          if (hasNavIds) {
            $.each(facet.navIds, $.proxy(function (idx, id) {
              if (navAdded[id] === false) {
                this._addFacet(data, id, depth, maxDepth, false);
              }
            }, this));
          }
        }
      }
    },
    _addFacet: function (data, id, depth, maxDepth, isPath) {
      var facet = data[id] || {};
      var text;
      if ($.isFunction(this.options.optionFormatter)) {
        text = this.options.optionFormatter.call(this, {
          id: id,
          facet: facet,
          depth: depth
        });
      } else {
        text = this.options.optionTemplate
          .replace(/\{option\}/g, facet.label || id)
          .replace(/\{count\}/g, 'undefined' !== typeof facet.count ? facet.count : this.options.missingCount);
      }
      var leading = "";
      if ('' !== this.options.indent) {
        var idx;
        for (idx = 1; idx < depth; idx += 1) {
          leading += this.options.indent;
        }
      }
      if ('undefined' !== typeof text) {
        var path = [];
        var parentId = facet.parentId;
        while ('undefined' !== typeof parentId && '' !== parentId) {
          path.push(parentId);
          parentId = (data[parentId] || {}).id;
        }
        path.reverse();
        $('<option/>')
          .val(id)
          .text(leading + text)
          .data('count', 'undefined' !== typeof facet.count ? facet.count : 0)
          .data('depth', depth)
          .data('is-path', isPath)
          .data('path', path)
          .appendTo(this.element);
        this._addFacets(data, facet, depth + 1, maxDepth);
      }
    }
  });
}(jQuery));
