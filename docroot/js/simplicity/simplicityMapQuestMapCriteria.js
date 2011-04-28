/**
 * @name $.ui.simplicityMapQuestMapCriteria
 * @namespace A MapQuest map
 * <p>
 * jQuery UI widget that displays discovery search criteria locations on a map. This widget uses the query explanation output from
 * the discovery engine response, so the query to the engine must ask for this extra information with
 * <code>"explain": "criterionValue"</code>.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityMapQuestMapCriteria();
 *   &lt;/script>
 *
 * @see MapQuest JavaScript SDK v6 <a href="http://platform.beta.mapquest.com/sdk/js/v6.0.0/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityMapQuestMapCriteria", {
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
     *   <dt>updateBounds<dt>
     *   <dd>
     *     Whether or not the map bounds should be updated to include the criteria locations. Defaults to true.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityMapQuestMapCriteria.options
     */
    options : {
      searchElement: 'body',
      updateBounds: true,
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-mapquest-map-criteria');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityMapQuestMap('map');
      this._markers = [];
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._responseHandler, this));
      this.element.bind('simplicitymapquestmapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityMapQuestMapCriteria.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityMapQuestMapCriteria.refreshMap
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
     * @name $.ui.simplicityMapQuestMapCriteria._responseHandler
     * @function
     * @private
     */
    _responseHandler: function (evt, ui) {
      this.removeCriteria();
      this.addCriteria(ui);
    },
    _calcBoundsHandler: function (evt, ui) {
      var locations = ui.locations;
      if ($.isArray(locations) && this.options.updateBounds) {
        $.each(this._markers, function (pmIdx, poly) {
          if (typeof poly.shapePoints !== 'undefined' && $.isArray(poly.shapePoints)) {
            for (var i = 0; i + 1 < poly.shapePoints.length; i += 2) {
              locations.push({lat: poly.shapePoints[i], lng: poly.shapePoints[i + 1]});
            }
          } else if (typeof poly.latLng !== 'undefined') {
            locations.push(poly.latLng);
          }
        });
      }
    },

    /**
     * Removes any markers that were added to the map by <code>addCriteria</code>.
     *
     * @name $.ui.simplicityMapQuestMapCriteria.removeCriteria
     * @function
     * @private
     */
    removeCriteria: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        this._map.removeShape(marker);
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers and shapes that can be extracted from the given <code>searchResponse</code>.
     *
     * @name $.ui.simplicityMapQuestMapCriteria.addCriteria
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
              var converted = $.simplicityGeoJsonToMapQuest(pm);
              var markers = converted.vendorObjects;
              if (markers.length !== 0) {
                var markerEvent = {
                  map: this._map,
                  markers: markers,
                  geoJson: converted.geoJson
                };
                this._trigger('placemark', {}, markerEvent);
                markers = markerEvent.markers;
                if ('undefined' !== typeof markers) {
                  $.each(markers, $.proxy(function (idx, marker) {
                    this._markers.push(marker);
                    this._map.addShape(marker);
                  }, this));
                }
              }
            }, this));
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-mapquest-map-criteria');
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._responseHandler);
      this.element.unbind('simplicitymapquestmapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      delete this._map;
      delete this._markers;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
