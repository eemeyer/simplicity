/**
 * @name $.ui.simplicityGoogleMapBoundsCoordinator
 * @namespace A Google map.
 * <p>
 * An invisible jquery ui widget which coordinates the updating of a Google Map's bounds after a discovery search
 * response is parsed and dispatched (the simplicitySearchResponseHandled event from the simplicityDiscoverySearch
 * widget. Triggers a simplicitygooglemapboundscoordinatorcalculatebounds event which other components can use to
 * modify the map bounds.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapBoundsCoordinator();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="https://developers.google.com/maps/documentation/javascript/reference">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapBoundsCoordinator", $.ui.simplicityWidget, {
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
     * @name $.ui.simplicityGoogleMapBoundsCoordinator.options
     */
    options: {
      searchElement: 'body',
      map: ''
    },
    _create: function () {
      this._addClass('ui-simplicity-google-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      this._bind(this.options.searchElement, 'simplicitySearchResponseHandled', function () {
        this.updateBounds();
      });
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMapBoundsCoordinator.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Triggers a simplicitygooglemapboundscoordinatorcalculatebounds event. Handlers for that event receive a ui
     * object with a bounds member. They can update, replace or delete that variable. ui.bounds is defined and non-empty
     * after the event is handled, then this component will update the google maps to fit the bounds.
     *
     * @name $.ui.simplicityGoogleMapBoundsCoordinator.updateBounds
     * @function
     */
    updateBounds: function () {
      var bounds = new google.maps.LatLngBounds();
      var ui = {
        bounds: bounds
      };
      this._trigger('calculateBounds', {}, ui);
      bounds = ui.bounds;
      if ('undefined' !== typeof bounds && !bounds.isEmpty()) {
        this._map.fitBounds(bounds);
      }
    }
  });
}(jQuery));
