/**
 * @name $.ui.simplicityFacetCount
 * @namespace Displays a single facet count based on the search results.
 *
 * Listens for simplicitySearchResponse events and updates element HTML with a templatized
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
  $.widget("ui.simplicityFacetCount", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The location of the simplicityDiscoverySearch widget. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>missingCount</dt>
     *   <dd>
     *     Text to use when there is no associated facet count. Defaults to <code>'?'</code>.
     *   </dd>
     *   <dt>dimension</dt>
     *   <dd>
     *     Mandatory dimension from which the facet counts should be used.
     *   </dd>
     *   <dt>facetsKey</dt>
     *   <dd>
     *     The key used in the facets request to identify the facets data. Defaults to <code>dimension</code>.
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
      missingCount: '?',
      dimension: '',
      facetsKey: '',
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
      this._addClass('ui-simplicity-facet-count');
      this.options.facetsKey = this.options.facetsKey || this.options.dimension;
      if (this.element[0].nodeName === 'OPTION') {
        // If the option has no value attribute, create one so the
        // value doesn't change when we update the text.
        this._optionText = this.element.text();
        var val = this.element.val();
        if (this.element.attr('value') !== val) {
          this.element.attr('value', val);
        }
      }
      this._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler);
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event.
     * Extracts the configured facet count and displays it.
     *
     * @name $.ui.simplicityFacetCount._searchResponseHandler
     * @function
     * @private
     */
    _searchResponseHandler: function (event, searchResponse) {
      var result = undefined;
      var discoveryResponse = searchResponse._discovery || {};
      var engineResponse = discoveryResponse.response || {};
      var facets = engineResponse.facets;
      if ('undefined' === typeof facets) {
        var drillDownResponse = searchResponse.drillDown || {};
        var drillDownData = drillDownResponse[this.options.facetsKey];
        if (drillDownData) {
          var counts = drillDownData.exact;
          result = counts[this.options.facetId];
        }
      } else {
        var facet = facets[this.options.facetsKey];
        if (facet) {
          if ('undefined' !== typeof facet.data) {
            var facetData = facet.data[this.options.facetId];
            if ('undefined' !== typeof facetData) {
              result = facetData.count;
            }
          }
        }
      }
      if ('undefined' === typeof result) {
        result = this.options.missingCount;
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
    }
  });
}(jQuery));
