/**
 * @name $.ui.simplicitySearchResults
 * @namespace Widget that displays the search results
 *
 * <h2>Options</h2>
 * <dl>
 *   <dt>searchElement</dt>
 *   <dd>
 *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
 *   </dd>
 * </dl>
 */
(function ($) {
  $.widget("ui.simplicitySearchResults", {
    options: {
      stateElement: 'body'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-search-results');
      $(this.options.stateElement).bind('simplicitySearchResponse', $.proxy(this._searchResponseHandler, this));
    },
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
      $(this.options.stateElement).unbind('simplicitySearchResponse', this._searchResponseHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
