/**
 * @name $.ui.simplicityFacetCount
 * @namespace Displays a single facet count based on the search results.
 *
 * Listens for simplicityFacetCounts events and updates element HTML with a templatized
 * facet count. Also supports injecting the facet count into a select input.
 * <p>
 * This widget is generally used as a building block, you probably want to use
 * <code>simplicityFacetedInput</code> directly.
 *
 * @example
 *   &lt;select id="size" name="size">
 *     &lt;option value="small">Small&lt;/option>
 *     &lt;option value="medium">Medium&lt;/option>
 *     &lt;option value="large">Large&lt;/option>
 *   &lt;/select>
 *   &lt;script type="text/javascript">
 *     $('#size option[value="small"]').simplicityFacetCount({
 *       dimension: 'Size',
 *       facetId: 'S'
 *     });
 *     // etc.
 *   &lt;/script>
 *
 * @example
 *   &lt;input type="checkbox" id="large" name="size" value="large" />
 *   &lt;label for="large">Large (&lt;span id="largeCount">&lt;/span>)&lt;/label>
 *   &lt;script type="text/javascript">
 *     $('#largeCount').simplicityFacetCount({
 *       dimension: 'Size',
 *       facetId: 'L'
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityFacetCount", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The location of the simplicityDiscoverySearch widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>missingText</dt>
     *   <dd>
     *     Text to use when there is no associated facet count. Defaults to <code>'?'</code>.
     *   </dd>
     *   <dt>dimension</dt>
     *   <dd>
     *     Mandatory dimension from which the facet counts should be used.
     *   </dd>
     *   <dt>facetId</dt>
     *   <dd>
     *     Mandatory id of the facet whose count should be bound to this widget.
     *   </dd>
     *   <dt>optionTemplate</dt>
     *   <dd>
     *     Template used when bound to an <code>option</code> element.
     *     Defaults to <code>'{option} {count}'</code>. Bracketed text will be
     *     replaced by the option value and any formatted count respectively.
     *     Other text not included in the bracketed fields will be left as-is.
     *     Applies only to facet counts for OPTION tags.
     *   </dd>
     *   <dt>numberFormatter</dt>
     *   <dd>
     *     Optional function that can be called with the facet count and is expected
     *     to return a string.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityFacetCount.options
     */
    options : {
      searchElement: 'body',
      missingText: '?',
      dimension: '',
      facetId: '',
      optionTemplate: '{option} {count}',
      /**
       * Format a face count value. Returning the facet count as a formatted
       * string.
       *
       * @name $.ui.simplicityFacetCount.numberFormatter
       * @function
       * @param count The facet count to format
       * @example
       *   &lt;select id="size" name="size">
       *     &lt;option value="small">Small&lt;/option>
       *     &lt;option value="medium">Medium&lt;/option>
       *     &lt;option value="large">Large&lt;/option>
       *   &lt;/select>
       *   &lt;script type="text/javascript">
       *     $('#size option[value="small"]').simplicityFacetCount({
       *       dimension: 'Size',
       *       facetId: 'S',
       *       numberFormatter: function(count) {
       *        return "(" + count + ")";
       *       }
       *     });
       *     // etc.
       *   &lt;/script>
       */
      numberFormatter: ''
    },
    _create : function () {
      if (this.options.facetId === '') {
        return;
      }
      this.element.addClass('ui-simplicity-facet-count');
      if (this.element[0].nodeName === 'OPTION') {
        // If the option has no value attribute, create one so the
        // value doesn't change when we update the text.
        this._optionText = this.element.text();
        var val = this.element.val();
        if (this.element.attr('value') !== val) {
          this.element.attr('value', val);
        }
      }
      $(this.options.searchElement).bind('simplicityFacetCounts', $.proxy(this._facetCountsHandler, this));
    },
    /**
     * Event handler for the <code>simplicityFacetCounts</code> event.
     * Extracts the configured facet count and displays it.
     *
     * @name $.ui.simplicityFacetCount._facetCountsHandler
     * @function
     * @private
     */
    _facetCountsHandler: function (event, dimFacetCounts) {
      var result = undefined;
      var facetCounts = dimFacetCounts[this.options.dimension];
      if (facetCounts) {
        var counts = facetCounts.exact;
        result = counts[this.options.facetId];
      }
      if ('undefined' === typeof result) {
        result = this.options.missingText;
      } else if ($.isFunction(this.options.numberFormatter)) {
        result = this.options.numberFormatter(result);
      } else {
        result = String(result);
      }
      if (this.element[0].nodeName === 'OPTION') {
        result = this.options.optionTemplate
          .replace(/\{option\}/g, this._optionText)
          .replace(/\{count\}/g, result);
        this.element.text(result);
      } else {
        this.element.html(result);
      }
    },
    destroy : function () {
      this.element.removeClass('ui-simplicity-facet-count');
      if (this.element[0].nodeName === 'OPTION') {
        this.element.text(this._optionText);
        delete this._optionText;
      }
      $(this.options.searchElement).unbind('simplicityFacetCounts', this._facetCountsHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
