/**
 * @name $.ui.simplicityBucketCount
 * @namespace Displays a single bucket count based on the search results
 */
(function ($) {
  $.widget("ui.simplicityBucketCount", {
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
