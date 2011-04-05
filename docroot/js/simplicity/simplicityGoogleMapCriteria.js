/**
 * @name $.ui.simplicityGoogleMapCriteria
 * @namespace A Google map.
 * <p>
 * jQuery UI widget that displays discovery search criteria locations on a map. This widget uses the query explanation output from
 * the discovery engine response, so the query to the engine must ask for this extra information with
 * <code>"explain": "criterionValue"</code>.
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
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be looked up. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>updateBounds</dt>
     *   <dd>
     *     Whether or not the map bounds should be updated to include the criteria locations. Defaults to true.
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
     * Makes the widget re-handle the last <code>simplicitySearchResponse</code> event to reapply
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
     * Event handler for the <code>simplicitySearchResponse</code> event.
     * Extracts the placemarks for all of the criteria locations, and places markers or shapes on the map for each.
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
     * Removes any markers or shapes that were added to the map by <code>addCriteria</code>.
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
     * Adds any markers and shapes that can be extracted from the given <code>searchResponse</code>.
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
              var markers = $.simplicityGeoJsonToGoogle(pm);
              if (markers.length !== 0 && markers[0].type !== 'Error') {
                var markerEvent = {
                  map: this._map,
                  markers: markers,
                  geoJson: pm
                };
                this._trigger('placemark', {}, markerEvent);
                markers = markerEvent.markers;

                if ('undefined' !== typeof markers) {
                  $.each(markers, $.proxy(function (idx, marker) {
                    marker.setMap(this._map);
                    this._markers.push(marker);
                  }, this));
                }
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
