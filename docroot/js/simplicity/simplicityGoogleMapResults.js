/**
 * @name $.ui.simplicityGoogleMapResults
 * @namespace A Google map.
 * <p>
 * Google Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapResults();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapResults", {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>searchElement</dt>
     *   <dd>
     *     The simplicityDiscoverySearch widget that this widget binds it's events to. Defaults to <code>'body'</code>.
     *   </dd>
     *   <dt>latitudeField</dt>
     *   <dd>
     *     Field to find the latitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'latitude'</code>.
     *   </dd>
     *   <dt>longitudeField</dt>
     *   <dd>
     *     Field to find the longitude of the result item in the <code>simplicityResultSet</code>
     *     item properties. Defaults to <code>'longitude'</code>.
     *   </dd>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>updateBounds</dt>
     *   <dd>
     *     Whether or not the map bounds should be updated to include the result locations. Defaults to true.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapResults.options
     */
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      updateBounds: true,
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map-results');
      this._markers = [];
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
      this.element.bind('simplicitygooglemapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMapResults.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityGoogleMapResults.refreshMap
     * @function
     */
    refreshMap: function () {
      this.removeMarkers();
      this.addMarkers();
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityGoogleMapResults._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      this.removeMarkers();
      this.addMarkers(resultSet);
    },
    _calcBoundsHandler: function (evt, ui) {
      var bounds = ui.bounds;
      if ('undefined' !== typeof bounds && this.options.updateBounds) {
        $.each(this._markers, function (idx, marker) {
          bounds.extend(marker.getPosition());
        });
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addMarkers</code>.
     *
     * @name $.ui.simplicityGoogleMapResults.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      $.each(this._markers, function (idx, marker) {
        marker.setMap(null);
      });
      this._markers.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityGoogleMapResults.addMarkers
     * @function
     * @private
     */
    addMarkers: function (resultSet) {
      if ('undefined' === typeof resultSet) {
        resultSet = $(this.options.searchElement).simplicityDiscoverySearch('resultSet');
      }
      if (resultSet.rows.length > 0) {
        $.each(resultSet.rows, $.proxy(function (idx, row) {
          var properties = row.properties;
          if ('undefined' !== typeof properties) {
            var latitude = properties[this.options.latitudeField];
            var longitude = properties[this.options.longitudeField];
            if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
              var point = new google.maps.LatLng(latitude, longitude);
              var marker = new google.maps.Marker({
                position: point
              });
              var markerEvent = {
                row: row,
                map: this._map,
                marker: marker
              };
              this._trigger('marker', {}, markerEvent);
              marker = markerEvent.marker;
              if ('undefined' !== typeof marker) {
                marker.setMap(this._map);
                this._markers.push(marker);
              }
            }
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-map-results');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      this.element.unbind('simplicitygooglemapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
