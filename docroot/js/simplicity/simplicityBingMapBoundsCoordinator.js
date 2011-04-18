/**
 * @name $.ui.simplicityBingMapBoundsCoordinator
 * @namespace A Bing map.
 * <p>
 * An invisible jquery ui widget which coordinates the updating of a Bing Map's bounds after a discovery search
 * response is parsed and dispatched (the simplicitySearchResponseHandled event from the simplicityDiscoverySearch
 * widget. Triggers a simplicitybingmapboundscoordinatorcalculatebounds event which other components can use to
 * modify the map bounds.
 *
 * @example
 *   &lt;div id="map" style="position: absolute; width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMapBoundsCoordinator({
 *       credentials: 'Your credentials go here'
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMapBoundsCoordinator", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMapBoundsCoordinator.options
     */
    options: {
      searchElement: 'body',
      map: ''
    },
    _create : function () {
      this.element.addClass('ui-simplicity-bing-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityBingMap('map'); // TODO: will this work if map API is not yet loaded?
      $(this.options.searchElement).bind('simplicitySearchResponseHandled', $.proxy(this._handler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityBingMapBoundsCoordinator.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _handler: function (evt) {
      this.updateBounds();
    },
    /**
     * Triggers a simplicitybingmapboundscoordinatorcalculatebounds event. Handlers for that event receive a ui
     * object with a locations member. They can update, replace or delete that variable. ui.locations is defined and non-empty
     * after the event is handled, then this component will update the bing map to fit the locations.
     *
     * @name $.ui.simplicityBingMapBoundsCoordinator.updateBounds
     * @function
     */
    updateBounds: function () {
      var ui = {
        locations: []
      };
      this._trigger('calculateBounds', {}, ui);
      if ('undefined' !== typeof ui.locations && 0 !== ui.locations.length) {
        this._map.setView({bounds: Microsoft.Maps.LocationRect.fromLocations(ui.locations)});
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-bing-map-bounds-coordinator');
      $(this.options.searchElement).unbind('simplicitySearchResponseHandled', this._handler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
