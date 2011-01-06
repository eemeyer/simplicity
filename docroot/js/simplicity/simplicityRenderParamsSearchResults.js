/**
 * @name $.ui.simplicityRenderParamsSearchResults
 * @namespace Widget that performs an AJAX request for rendered search results
 *
 * <h2>Options</h2>
 * <dl>
 *   <dt>searchElement</dt>
 *   <dd>
 *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
 *   </dd>
 *   <dt>url</dt>
 *   <dd>
 *     The url from which to get the rendered results.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.widget("ui.simplicityRenderParamsSearchResults", {
    options: {
      stateElement: 'body',
      url: ''
    },
    _create : function () {
      this.element.addClass('ui-simplicity-render-params-search-results');
      $(this.options.stateElement).bind('simplicitySearchResponse', $.proxy(this._searchResponseHandler, this));
    },
    _searchResponseHandler: function (evt, searchResponse) {
      var renderParameters = '';
      if (searchResponse && searchResponse._discovery && searchResponse._discovery.response) {
        var discoveryResponse = searchResponse._discovery.response;
        renderParameters = discoveryResponse.renderParameters || '';
      }
      if (renderParameters === '') {
        this.element.html('');
      } else {
        var url = this.options.url + '?' + renderParameters;
        this.element.load(url, null, $.proxy(function (responseText, statusText, xhr) {
          if (xhr.status < 200 || xhr.status >= 300) {
            var error = $('<div class="ui-state-error-text"/>');
            error.text('[' + xhr.status + '] ' + xhr.statusText + '\n' + responseText);
            this.element.append(error);
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-render-params-search-results');
      $(this.options.stateElement).unbind('simplicitySearchResponse', this._searchResponseHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
