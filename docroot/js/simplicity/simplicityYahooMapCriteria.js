/**
 * @name $.ui.simplicityYahooMapCriteria
 * @namespace A Yahoo! map.
 * <p>
 * Yahho! Map widget that creates the map and listens for <code>simplicityResultSet</code> events
 * which it uses to add markers to the map for the search results.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityYahooMap();
 *   &lt;/script>
 *
 * @see Yahoo! Maps Web Services - AJAX API <a href="http://developer.yahoo.com/maps/ajax/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityYahooMapCriteria", {
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
     *       center: new YGeoPoint(0, 0),
     *       zoom: 16,
     *       mapTypeId: YAHOO_MAP_REG
     *     }
     *     </pre>
     *     Can be either an <code>Object</code> or a <code>function</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'endPan,endAutoPan,changeZoom'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityYahooMapCriteria.options
     */
    options : {
      searchElement: 'body',
      updateBounds: true,
      map: ''
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map-criteria');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityYahooMap('map');
      this._markers = [];
      $(this.options.searchElement).bind('simplicitySearchResponse', $.proxy(this._responseHandler, this));
      this.element.bind('simplicityyahoomapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMapCriteria.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityYahooMapCriteria.refreshMap
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
     * @name $.ui.simplicityYahooMapCriteria._responseHandler
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
          if ($.isArray(poly._paths)) {
            $.merge(locations, poly._paths);
          } else if ('undefined' !== typeof poly.YGeoPoint && 'undefined' !== typeof poly.YGeoPoint.Lat) {
            locations.push(poly.YGeoPoint);
          }
        });
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addCriteria</code>.
     *
     * @name $.ui.simplicityYahooMapCriteria.removeCriteria
     * @function
     * @private
     */
    removeCriteria: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        this._map.removeOverlay(marker);
      }, this));
      this._markers.length = 0;
    },
    /**
     * Adds any markers and shapes that can be extracted from the given <code>searchResponse</code>.
     *
     * @name $.ui.simplicityYahooMapCriteria.addCriteria
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
              var converted = $.simplicityGeoJsonToYahoo(pm);
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
                    this._map.addOverlay(marker);
                  }, this));
                }
              }
            }, this));
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map-criteria');
      $(this.options.searchElement).unbind('simplicitySearchResponse', this._responseHandler);
      this.element.unbind('simplicityyahoomapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      delete this._map;
      delete this._markers;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
