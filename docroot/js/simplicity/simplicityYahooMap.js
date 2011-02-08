/**
 * @name $.ui.simplicityYahooMap
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
  $.widget("ui.simplicityYahooMap", {
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
     * </dl>
     * @name $.ui.simplicityYahooMap.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      mapOptions: '',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '3.8'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map');
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityYahooMap._initWhenAvailable
     * @function
     * @private
     */    _initWhenAvailable: function () {
      var available = false;
      if ('undefined' !== typeof this._map) {
        available = true;
      } else if ('undefined' !== typeof YMap) {
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = {
            center: new YGeoPoint(0, 0),
            zoom: 16,
            mapType: YAHOO_MAP_REG
          };
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = this.options.mapOptions.call(this);
        } else {
          mapOptions = this.options.mapOptions;
        }
        this._map = new YMap(this.element[0]);
        this._map.setMapType(mapOptions.mapType);
        this._map.drawZoomAndCenter(mapOptions.center, mapOptions.zoom);
        available = true;
      }
      return available;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMap.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityYahooMap.loadMap
     * @function
     * @private
     */
    loadMap: function () {
      if ('undefined' === typeof this._map) {
        if ('undefined' === typeof YMap) {
          var src = 'http://api.maps.yahoo.com/ajaxymap?v=' + this.options.mapVersion;
          if ('undefined' === typeof $.simplicityLoadJs) {
            src = src + '&appid=YOUR_APP_ID';
            alert('Dynamic loading of Yahoo! maps is not supported. Enable this widget by adding the following script tag to your page:\n\n' +
              '<script type="text/javascript" src="' + src + '"></script>');
          } else {
            if (this.options.apiKey !== '') {
              src = src + '&appid=' + this.options.apiKey;
            }
            $.simplicityLoadJs(src, $.proxy(function () {
              this.refreshMap();
            }, this));
          }
        }
      }
    },
    /**
     * Makes the widget re-handle the last <code>simplicityResultSet</code> event to reapply
     * any map markers.
     *
     * @name $.ui.simplicityYahooMap.refreshMap
     * @function
     */
    refreshMap: function () {
      this._resultSetHandler({}, $(this.options.searchElement).simplicityDiscoverySearch('resultSet'));
    },
    /**
     * Event handler for the <code>simplicityResultSet</code> event. Extracts the coordinates
     * of each result item by using the property fields defined by the
     * <code>latitudeField</code> and <code>longitudeField</code> options of this widget and
     * places a marker on the map for each valid coordinate. The map is then reset to best
     * display the current set of markers.
     *
     * @name $.ui.simplicityYahooMap._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this._map.removeMarkersAll();
        if (resultSet.rows.length > 0) {
          var locations = [];
          $.each(resultSet.rows, $.proxy(function (idx, row) {
            var properties = row.properties;
            if ('undefined' !== typeof properties) {
              var latitude = properties[this.options.latitudeField];
              var longitude = properties[this.options.longitudeField];
              if ('undefined' !== typeof latitude && 'undefined' !== typeof longitude) {
                latitude = Number(latitude);
                longitude = Number(longitude);
                var point = new YGeoPoint(latitude, longitude);
                locations.push(point);
                var marker = new YMarker(point);
                this._map.addOverlay(marker);
              }
            }
          }, this));
          var bounds = this._map.getBestZoomAndCenter(locations);
          this._map.drawZoomAndCenter(bounds.YGeoPoint, bounds.zoomLevel);
        }
      }
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
