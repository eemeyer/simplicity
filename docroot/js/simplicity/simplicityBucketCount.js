/**
 * @name $.ui.simplicityBucketCount
 * @namespace Displays a single bucket count based on the search results.
 *
 * Listens for simplicityBucketCounts events and updates element HTML with a templatized
 * bucket count. Also supports injecting the bucket count into a select input.
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
 *     $('#size option[value="small"]').simplicityBucketCount({
 *       dimension: 'Size',
 *       bucketId: 'S'
 *     });
 *     // etc.
 *   &lt;/script>
 *
 * @example
 *   &lt;input type="checkbox" id="large" name="size" value="large" />
 *   &lt;label for="large">Large (&lt;span id="largeCount">&lt;/span>)&lt;/label>
 *   &lt;script type="text/javascript">
 *     $('#largeCount').simplicityBucketCount({
 *       dimension: 'Size',
 *       bucketId: 'L'
 *     });
 *   &lt;/script>
 */
(function ($) {
  $.widget("ui.simplicityBucketCount", {
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
     *     Text to use when there is no associated bucket count. Defaults to <code>'?'</code>.
     *   </dd>
     *   <dt>dimension</dt>
     *   <dd>
     *     Mandatory dimension from which the bucket counts should be used.
     *   </dd>
     *   <dt>bucketId</dt>
     *   <dd>
     *     Mandatory id of the bucket whose count should be bound to this widget.
     *   </dd>
     *   <dt>optionTemplate</dt>
     *   <dd>
     *     Template used when bound to an <code>option</code> element.
     *     Defaults to <code>'{option} {count}'</code>.
     *   </dd>
     *   <dt>numberFormatter</dt>
     *   <dd>
     *     Optional function that can be called with the bucket count and is expected
     *     to return a string.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBucketCount.options
     */
    options : {
      searchElement: 'body',
      missingText: '?',
      dimension: '',
      bucketId: '',
      optionTemplate: '{option} {count}',
      numberFormatter: ''
    },
    _create : function () {
      if (this.options.bucketId === '') {
        return;
      }
      this.element.addClass('ui-simplicity-bucket-count');
      if (this.element[0].nodeName === 'OPTION') {
        // If the option has no value attribute, create one so the
        // value doesn't change when we update the text.
        this._optionText = this.element.text();
        var val = this.element.val();
        if (this.element.attr('value') !== val) {
          this.element.attr('value', val);
        }
      }
      $(this.options.searchElement).bind('simplicityBucketCounts', $.proxy(this._bucketCountsHandler, this));
    },
    /**
     * Event handler for the <code>simplicityBucketCounts</code> event.
     * Extracts the configured bucket count and displays it.
     *
     * @name $.ui.simplicityBucketCount._bucketCountsHandler
     * @function
     * @private
     */
    _bucketCountsHandler: function (event, dimFacetCounts) {
      var result = undefined;
      var facetCounts = dimFacetCounts[this.options.dimension];
      if (facetCounts) {
        var counts = facetCounts.exact;
        result = counts[this.options.bucketId];
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
      this.element.removeClass('ui-simplicity-bucket-count');
      if (this.element[0].nodeName === 'OPTION') {
        this.element.text(this._optionText);
        delete this._optionText;
      }
      $(this.options.searchElement).unbind('simplicityBucketCounts', this._bucketCountsHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
