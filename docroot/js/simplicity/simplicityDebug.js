/**
 * @name $.ui.simplicityDebug
 * @namespace Displays text areas for the various event payloads in editable format.
 * @private
 */
(function ($) {
  $.widget("ui.simplicityDebug", {
    options : {
      stateElement: 'body',
      searchElement: 'body',
      template: '<div class="yui3-u-1-4"><fieldset class="ui-widget ui-widget-content"><legend/><textarea cols="24" rows="30"/></fieldset></div>'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-debug');
      this.element.children().remove();

      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._searchResponseHandler, this));
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
      $(this.options.searchElement).bind('simplicityFacetCounts', $.proxy(this._facetCountsHandler, this));
      this._addChild('State', '_state', this._stateChanger);
      this._addChild('SearchResponse', '_searchResponse', this._searchResponseChanger);
      this._addChild('ResultSet', '_resultSet', this._resultSetChanger);
      this._addChild('FacetCounts', '_facetCounts', this._facetCountsChanger);
    },
    _addChild: function (label, name, handler) {
      var state = $(this.options.template);
      state.find('legend').text(label);
      this[name] = state.find('textarea');
      this[name].bind('change', $.proxy(handler, this));
      this.element.append(state);
    },
    _stateChangeHandler: function (evt, state) {
      this._state.val(JSON.stringify(state, null, '  '));
    },
    _stateChanger: function (evt, ui) {
      $(this.options.stateElement).simplicityState('state', JSON.parse($(evt.target).val()));
    },
    _searchResponseHandler: function (evt, response) {
      this._searchResponse.text(JSON.stringify(response, null, '  '));
    },
    _searchResponseChanger: function (evt, ui) {
      $(this.options.searchElement).simplicityDiscoverySearch('searchResponse', JSON.parse($(evt.target).val()));
    },
    _resultSetHandler: function (evt, resultSet) {
      this._resultSet.text(JSON.stringify(resultSet, null, '  '));
    },
    _resultSetChanger: function (evt, ui) {
      $(this.options.searchElement).simplicityDiscoverySearch('resultSet', JSON.parse($(evt.target).val()));
    },
    _facetCountsHandler: function (evt, facetCounts) {
      this._facetCounts.text(JSON.stringify(facetCounts, null, '  '));
    },
    _facetCountsChanger: function (evt, ui) {
      $(this.options.searchElement).simplicityDiscoverySearch('facetCounts', JSON.parse($(evt.target).val()));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-debug');
      this._state.unbind('change', this._stateChanger);
      this._searchResponse.unbind('change', this._searchResponseChanger);
      this._resultSet.unbind('change', this._resultSetChanger);
      this._facetCounts.unbind('change', this._facetCountsChanger);
      $(this.options.stateElement).unbind('_stateChangeHandler', this._stateChangeHandler);
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._searchResponseHandler);
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $(this.options.searchElement).unbind('simplicityFacetCounts', this._facetCountsHandler);
      this.element.children().remove();
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
