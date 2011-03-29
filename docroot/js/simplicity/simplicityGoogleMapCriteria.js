/**
 * @name $.ui.simplicityGoogleMapCriteria
 * @namespace A Google map.
 * <p>
 * Google Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityGoogleMapCriteria();
 *   &lt;/script>
 *
 * @see Google Maps JavaScript API V3 <a href="http://code.google.com/apis/maps/documentation/javascript/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityGoogleMapCriteria", {
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
     * </dl>
     * @name $.ui.simplicityGoogleMapCriteria.options
     */
    options: {
      searchElement: 'body',
      updateBounds: true,
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-google-map-criteria');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityGoogleMap('map');
      this._markers = [];
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._responseHandler, this));
      this.element.bind('simplicitygooglemapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityGoogleMapCriteria.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityGoogleMapCriteria.refreshMap
     * @function
     */
    refreshMap: function () {
      this.removeCriteria();
      this.addCriteria();
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityGoogleMapCriteria._responseHandler
     * @function
     * @private
     */
    _responseHandler: function (evt, ui) {
      this.removeCriteria();
      this.addCriteria(ui);
    },
    _calcBoundsHandler: function (evt, ui) {
      var bounds = ui.bounds;
      if ('undefined' !== typeof bounds && this.options.updateBounds) {
        $.each(this._markers, function (pmIdx, poly) {
          if (poly.getBounds) {
            bounds = poly.getBounds();
          } else if (poly.getPaths) {
            $.each(poly.getPaths().getArray(), function (idx, path) {
              $.each(path.getArray(), function (idx2, latlng) {
                bounds.extend(latlng);
              });
            });
          } else if (poly.getPath) {
            $.each(poly.getPath().getArray(), function (idx, latlng) {
              bounds.extend(latlng);
            });
          } else if (poly.getPosition) {
            bounds.extend(poly.getPosition());
          }
        });
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addCriteria</code>.
     *
     * @name $.ui.simplicityGoogleMapCriteria.removeCriteria
     * @function
     * @private
     */
    removeCriteria: function () {
      $.each(this._markers, function (idx, marker) {
        marker.setMap(null);
      });
      this._markers.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityGoogleMapCriteria.addCriteria
     * @function
     * @private
     */
    addCriteria: function (ui) {
      if ('undefined' === typeof ui) {
        ui = $(this.options.searchElement).simplicityDiscoverySearch('searchResponse');
      }
      if ($.isArray(ui._discovery.response.explanation)) {
        $.each(ui._discovery.response.explanation, $.proxy(function (idx, exp) {
          if (exp.criterionValue && $.isArray(exp.criterionValue.placemarks)) {
            $.each(exp.criterionValue.placemarks, $.proxy(function (idx, pm) {
              var marker = new GeoJSON(pm);
              marker.set('geojson', pm);
              var markerEvent = {
                map: this._map,
                marker: marker
              };
              this._trigger('marker', {}, markerEvent);
              marker = markerEvent.marker;
              if ('undefined' !== typeof marker) {
                marker.setMap(this._map);
                this._markers.push(marker);
              }
            }, this));
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-google-map-criteria');
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._responseHandler);
      this.element.unbind('simplicitygooglemapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
