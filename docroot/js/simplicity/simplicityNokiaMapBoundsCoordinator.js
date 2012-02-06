/**
 * @name $.ui.simplicityNokiaMapBoundsCoordinator
 * @namespace A Nokia map
 * <p>
 * An invisible jquery ui widget which coordinates the updating of a Nokia Map's bounds after a discovery search
 * response is parsed and dispatched (the simplicitySearchResponseHandled event from the simplicityDiscoverySearch
 * widget. Triggers a simplicitynokiamapboundscoordinatorcalculatebounds event which other components can use to
 * modify the map bounds.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityNokiaMap();
 *   &lt;/script>
 *
 * @see Nokia Maps - JavaScript API <a href="http://api.maps.nokia.com/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityNokiaMapBoundsCoordinator", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityNokiaMapBoundsCoordinator.options
     */
    options : {
      searchElement: 'body',
      map: ''
    },
    _create: function () {
      this._addClass('ui-simplicity-nokia-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityNokiaMap('map');
      this._bind(this.options.searchElement, 'simplicitySearchResponseHandled', function () {
        this.updateBounds();
      });
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityNokiaMapBoundsCoordinator.map
     * @function
     */
    map: function () {
      return this._map;
    },
    updateBounds: function () {
      var ui = {
        coordinates: []
      };
      this._trigger('calculateBounds', {}, ui);
      if ($.isArray(ui.coordinates) && ui.coordinates.length > 0) {
        var bounds = nokia.maps.geo.BoundingBox.coverAll(ui.coordinates);
        if (typeof bounds !== 'undefined') {
          this._map.zoomTo(bounds, false);
        }
      }
    }
  });
}(jQuery));
