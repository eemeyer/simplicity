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
  $.widget("ui.simplicitySearchResults", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>resultsCallback</dt>
     *   <dd>
     *     <p>This is the callback which creates the resultsHTML for display in the browser. This option
     *     only needs to be provided if the search response does not contain <code>resultsHtml</code>,
     *     for example, if directly querying a CORS-compatible Discovery Search Engine.
     *     Callback invocation signature: <code>function (resultsElement, searchResponse) {}</code></p>
     *
     *     <p>When not provided, the widget will look for the resultsHTML in the searchResponse.</p>
     *     Defaults to <code>''</code>.
     *   </dd>
     *   <dt>errorCallback</dt>
     *   <dd>
     *     <p>This is the callback which handles search response errors.
     *     Callback invocation signature: <code>function (resultsElement, searchResponse) {}</code></p>
     *   </dd>
     * </dl>
     * @name $.ui.simplicitySearchResults.options
     */
    options: {
      searchElement: 'body',
      resultsCallback: '',
      errorCallback: ''
    },
    _create : function () {
      this
        ._addClass('ui-simplicity-search-results')
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler);
    },
    _setOption: function (key, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if (key === 'resultsCallback' || key === 'errorCallback') {
        var searchResponse = $(this.options.searchElement).simplicityDiscoverySearch("searchResponse");
        this._searchResponseHandler({}, searchResponse);
      }
    },
    /**
     * Default event handler for the <code>simplicitySearchResponse</code> event. If there
     * is no option <code>resultsCallback</code>, expects the given
     * search response object to contain a <code>resultsHtml</code> field and splices it
     * directly into the page, otherwise option <code>resultsCallback</code> handles
     * the results logic.
     *
     * @name $.ui.simplicitySearchResults._searchResponseHandler
     * @function
     * @private
     */
    _searchResponseHandler: function (evt, searchResponse) {
      if (searchResponse.error) {
        var errorFn = $.isFunction(this.options.errorCallback) ? this.options.errorCallback : $.proxy(this._errorHandler, this);
        errorFn(this.element, searchResponse);
      } else {
        if ($.isFunction(this.options.resultsCallback)) {
          var result = this.options.resultsCallback(this.element, searchResponse);
          if (result === false) {
            this.element.html('undefined' !== typeof searchResponse.resultsHtml ? searchResponse.resultsHtml : '');
          }
        } else {
          this.element.html('undefined' !== typeof searchResponse.resultsHtml ?
            searchResponse.resultsHtml : 'Could not find resultsHtml in searchResponse. Did the controller return the results HTML?');
        }
      }
    },
    _errorHandler: function (resultsElement, searchResponse) {
      if (searchResponse.error) {
        var error = $('<div class="ui-state-error-text"/>');
        error.text('[' + searchResponse.status + '] ' + searchResponse.statusText + ((searchResponse.message) ? ", " + searchResponse.message : ""));
        resultsElement.html(error);
        return true;
      }
    }
  });
}(jQuery));
