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
      template: '<div class="yui3-u-1-2"><fieldset class="ui-widget ui-widget-content"><legend/><textarea cols="68" rows="30"/></fieldset></div>'
    },
    _create : function () {
      this.element.addClass('ui-simplicity-debug');
      this.element.children().remove();

      $(this.options.stateElement).bind('simplicityStateChange', $.proxy(this._stateChangeHandler, this));
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._searchResponseHandler, this));
      this._addChild('State', '_state', this._stateChanger);
      this._addChild('SearchResponse', '_searchResponse', this._searchResponseChanger);
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
    destroy: function () {
      this.element.removeClass('ui-simplicity-debug');
      this._state.unbind('change', this._stateChanger);
      this._searchResponse.unbind('change', this._searchResponseChanger);
      $(this.options.stateElement).unbind('simplicityStateChange', this._stateChangeHandler);
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._searchResponseHandler);
      this.element.children().remove();
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
