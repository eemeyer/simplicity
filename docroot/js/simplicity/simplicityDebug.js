/**
 * @name $.ui.simplicityDebug
 * @namespace Displays text areas for the various event payloads in editable format.
 * @private
 */
(function ($) {
  $.widget("ui.simplicityDebug", $.ui.simplicityWidget, {
    options : {
      stateElement: 'body',
      searchElement: 'body',
      template: '<div class="yui3-u-1-2"><fieldset class="ui-widget ui-widget-content"><legend/><textarea cols="68" rows="30"/></fieldset></div>'
    },
    _create : function () {
      this._addClass('ui-simplicity-debug');
      this.element.children().remove();

      this
        ._bind(this.options.stateElement, 'simplicityStateChange', this._stateChangeHandler)
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._searchResponseHandler);
      this._addChild('State', '_state', this._stateChanger);
      this._addChild('SearchResponse', '_searchResponse', this._searchResponseChanger);
    },
    _addChild: function (label, name, handler) {
      var state = $(this.options.template);
      state.find('legend').text(label);
      this[name] = state.find('textarea');
      this._bind(this[name], 'change', handler);
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
    destroy: function () {
      this.element.children().remove();
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
