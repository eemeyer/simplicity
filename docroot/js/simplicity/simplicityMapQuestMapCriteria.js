/**
 * @name $.ui.simplicityMapQuestMapCriteria
 * @namespace A MapQuest map
 * <p>
 * MapQuest Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityMapQuestMapOriginal();
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
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>fitOnResultSet<dt>
     *   <dd>
     *     When true the map is panned and zoomed to best fit the search
     *     results that are added as part of the <code>simplicityResultSet</code>
     *     event handler. Defaults to <code>true</code>.
     *   </dd>
     *   <dt>mapOptions</dt>
     *   <dd>
     *     Options used when creating the map. Defaults to <code>''</code> which is expanded at
     *     runtime to
     *     <pre>
     *     {
     *       center: {lat: 0, lng: 0},
     *       zoom: 1,
     *       mapType: 'map'
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'moveend,zoomend'</code>.
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
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
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
          if (typeof poly.shapePoints !== 'undefined' && $.isArray(poly.shapePoints.items)) {
            $.merge(locations, poly.shapePoints.items);
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
              var markers = $.simplicityGeoJsonToMapQuest(pm);
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
