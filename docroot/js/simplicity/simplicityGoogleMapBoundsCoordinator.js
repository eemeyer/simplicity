/**
 * @name $.ui.simplicityGoogleMapBoundsCoordinator
 * @namespace A Google map.
 * <p>
 * Google Map widget.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapBoundsCoordinator();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapBoundsCoordinator", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapBoundsCoordinator.options
     */
    options: {
      searchElement: 'body',
      map: '',
      mapOptions: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map-bounds-coordinator');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      $(this.options.searchElement).bind('simplicitySearchResponseHandled', $.proxy(this._handler, this));
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
    _handler: function (evt) {
      this.updateBounds();
    },
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
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-map-bounds-coordinator');
      $(this.options.searchElement).unbind('simplicitySearchResponseHandled', this._handler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
