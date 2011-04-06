/**
 * @name $.ui.simplicityYahooMapResults
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
  $.widget("ui.simplicityYahooMapResults", {
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
     * @name $.ui.simplicityYahooMapResults.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      map: '',
      updateBounds: true
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map-results');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityYahooMap('map');
      this._markers = [];
      this._locations = [];
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
      this.element.bind('simplicityyahoomapboundscoordinatorcalculatebounds', $.proxy(this._calcBoundsHandler, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMapResults.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityYahooMapResults.refreshMap
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
     * @name $.ui.simplicityYahooMapResults._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      this.removeMarkers();
      this.addMarkers(resultSet);
    },
    _calcBoundsHandler: function (evt, ui) {
      if ($.isArray(ui.locations) && this.options.updateBounds) {
        $.merge(ui.locations, this._locations);
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addMarkers</code>.
     *
     * @name $.ui.simplicityYahooMapResults.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      $.each(this._markers, $.proxy(function (idx, marker) {
        this._map.removeOverlay(marker);
      }, this));
      this._markers.length = 0;
      this._locations.length = 0;
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityYahooMapResults.addMarkers
     * @function
     * @private
     */
    addMarkers: function (resultSet) {
      if (resultSet.rows.length > 0) {
        $.each(resultSet.rows, $.proxy(function (idx, row) {
          var properties = row.properties;
          if ('undefined' !== typeof properties) {
            var latitude = properties[this.options.latitudeField];
            var longitude = properties[this.options.longitudeField];
            if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
              latitude = Number(latitude);
              longitude = Number(longitude);
              var point = new YGeoPoint(latitude, longitude);
              var marker = new YMarker(point);
              var markerEvent = {
                row: row,
                map: this._map,
                marker: marker
              };
              this._trigger('marker', {}, markerEvent);
              marker = markerEvent.marker;
              if ('undefined' !== typeof marker) {
                this._locations.push(point);
                this._markers.push(marker);
                this._map.addOverlay(marker);
              }
            }
          }
        }, this));
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map-results');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      this.element.unbind('simplicityyahoomapboundscoordinatorcalculatebounds', this._calcBoundsHandler);
      delete this._map;
      delete this._markers;
      delete this._locations;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
