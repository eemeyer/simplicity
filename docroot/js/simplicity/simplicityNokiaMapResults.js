/**
 * @name $.ui.simplicityNokiaMapResults
 * @namespace A Nokia map results drawer.
 * <p>
 * Widget that listens for <code>simplicityResultSet</code> events which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityNokiaMapResults();
 *   &lt;/script>
 *
 * @see Nokia Maps - JavaScript API <a href="http://api.maps.nokia.com/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityNokiaMapResults", $.ui.simplicityWidget, {
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
     * @name $.ui.simplicityNokiaMapResults.options
     */
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      updateBounds: true,
      map: ''
    },
    _create: function () {
      this._addClass('ui-simplicity-nokia-map-results');
      this._markers = [];
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityNokiaMap('map');
      this._markers = [];
      this
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._resultSetHandler)
        ._bind('simplicitynokiamapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityNokiaMapResults.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicitySearchResponse</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityNokiaMapResults.refreshMap
     * @function
     */
    refreshMap: function () {
      this.removeMarkers();
      this.addMarkers();
    },
    /**
     * Event handler for the <code>simplicitySearchResponse</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityNokiaMapResults._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, searchResponse) {
      this.removeMarkers();
      this.addMarkers(searchResponse);
    },
    _calcBoundsHandler: function (evt, ui) {
      var coordinates = ui.coordinates;
      if ('undefined' !== typeof coordinates && this.options.updateBounds) {
        $.each(this._markers, function (idx, marker) {
          coordinates.push(marker.coordinate);
        });
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addMarkers</code>.
     *
     * @name $.ui.simplicityNokiaMapResults.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        var eventData = {
          map: this._map,
          marker: marker
        };
        this._trigger('removemarker', {}, eventData);
        marker = eventData.marker;
        if ('undefined' !== typeof marker) {
          this._map.objects.remove(marker);
        }
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>searchResponse</code>.
     *
     * @name $.ui.simplicityNokiaMapResults.addMarkers
     * @function
     * @private
     */
    addMarkers: function (searchResponse) {
      if ('undefined' === typeof searchResponse) {
        searchResponse = $(this.options.searchElement).simplicityDiscoverySearch('searchResponse');
      }
      $.fn.simplicityDiscoverySearchItemEnumerator(searchResponse, $.proxy(function (idx, row) {
        var properties = row.properties;
        if ('undefined' !== typeof properties) {
          var latitude = properties[this.options.latitudeField];
          var longitude = properties[this.options.longitudeField];
          if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
            var marker = new nokia.maps.map.Marker([Number(latitude), Number(longitude)]);
            var eventData = {
              row: row,
              map: this._map,
              marker: marker
            };
            this._trigger('marker', {}, eventData);
            marker = eventData.marker;
            if ('undefined' !== typeof marker) {
              this._markers.push(marker);
              this._map.objects.add(marker);
            }
          }
        }
      }, this));
    }
  });
}(jQuery));
