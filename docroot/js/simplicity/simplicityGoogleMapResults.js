/**
 * @name $.ui.simplicityGoogleMapResults
 * @namespace A Google map.
 * <p>
 * Widget that listens for <code>simplicityResultSet</code> events which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapResults();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="https://developers.google.com/maps/documentation/javascript/reference">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapResults", $.ui.simplicityWidget, {
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
     *   <dt>markerType</dt>
     *   <dd>
     *     Optional marker type, either "overlay" or "google". Defaults to <code>overlay</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityGoogleMapResults.options
     */
    options: {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      updateBounds: true,
      map: '',
      markerType: 'overlay'
    },
    _create: function () {
      this._addClass('ui-simplicity-google-map-results');
      this._markers = [];
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      this
        ._bind(this.options.searchElement, 'simplicitySearchResponse', this._resultSetHandler)
        ._bind('simplicitygooglemapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
    },
    /**
     * Override of <code>_setOption</code> that is used to ensure that the
     * map is refreshed when the <code>markerType</code> changes.
     *
     * @name $.ui.simplicityGoogleMapResults._setOption
     * @function
     * @private
     */
    _setOption: function (option, value) {
      $.ui.simplicityWidget.prototype._setOption.apply(this, arguments);
      if ('markerType' === option) {
        this.refreshMap();
      }
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
     * Makes the widget re-handle the last <code>simplicitySearchResponse</code> event to reapply
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
     * Event handler for the <code>simplicitySearchResponse</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityGoogleMapResults._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, searchResponse) {
      this.removeMarkers();
      this.addMarkers(searchResponse);
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
      $.each(this._markers, $.proxy(function (idx, marker) {
        var eventData = {
          map: this._map,
          marker: marker
        };
        this._trigger('removemarker', {}, eventData);
        marker = eventData.marker;
        if ('undefined' !== typeof marker) {
          marker.setMap(null);
        }
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>searchResponse</code>.
     *
     * @name $.ui.simplicityGoogleMapResults.addMarkers
     * @function
     * @private
     */
    addMarkers: function (searchResponse) {
      if ('undefined' === typeof searchResponse) {
        searchResponse = $(this.options.searchElement).simplicityDiscoverySearch('searchResponse');
      }
      var markerFactory = $.simplicityGoogleMarker[this.options.markerType === 'google' ? 'createMarker' : 'createOverlayMarker'];
      $.fn.simplicityDiscoverySearchItemEnumerator(searchResponse, $.proxy(function (idx, row) {
        var properties = row.properties;
        if ('undefined' !== typeof properties) {
          var latitude = properties[this.options.latitudeField];
          var longitude = properties[this.options.longitudeField];
          if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
            var marker = markerFactory(
            {
              position: new google.maps.LatLng(latitude, longitude),
              row: row,
              html: row.index1,
              zIndex: -row.index1
            });
            var eventData = {
              row: row,
              map: this._map,
              marker: marker
            };
            this._trigger('marker', {}, eventData);
            marker = eventData.marker;
            if ('undefined' !== typeof marker) {
              marker.setMap(this._map);
              this._markers.push(marker);
            }
          }
        }
      }, this));
    }
  });
}(jQuery));
