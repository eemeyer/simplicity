/**
 * @name $.ui.simplicitySearchResults
 * @namespace Widget that displays the search results.
 *
 * This widget listens to the <code>simplicitySearchResponse</code> event and takes
 * the <code>resultsHtml</code> field from the search response, injecting it directly
 * into the page.
 * <p>
 * If your search controller does not inject the search results as HTML into it's response
 * then consider using <code>simplicityRenderParamsSearchResults</code> instead.
 */
(function ($) {
  $.widget("ui.simplicitySearchResults", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicitySearchResults.options
     */
    options: {
      searchElement: 'body'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-search-results');
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._searchResponseHandler, this));
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event. Expects the given
     * search response object to contain a <code>resultsHtml</code> field and splices it
     * directly into the page.
     *
     * @name $.ui.simplicitySearchResults._searchResponseHandler
     * @function
     * @private
     */
    _searchResponseHandler: function (evt, searchResponse) {
      var resultsHtml = searchResponse.resultsHtml || '';
      if (searchResponse.error) {
        var error = $('<div class="ui-state-error-text"/>');
        error.text('[' + searchResponse.status + '] ' + searchResponse.statusText);
        this.element.append(error);
      } else {
        this.element.html(resultsHtml);
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-search-results');
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._searchResponseHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
