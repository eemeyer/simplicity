/**
 * @name $.ui.simplicityYahooMapOriginal
 * @deprecated see simplicityYahooMap and its friends
 * @see $.ui.simplicityYahooMap
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
  $.widget("ui.simplicityYahooMapOriginal", {
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
     * @name $.ui.simplicityYahooMapOriginal.options
     */
    options : {
      searchElement: 'body',
      latitudeField: 'latitude',
      longitudeField: 'longitude',
      map: '',
      fitOnResultSet: true,
      mapOptions: '',
      mapMoveEvents: 'endPan,endAutoPan,changeZoom',
      // The following options are for internal use only
      apiKey: '',
      mapVersion: '3.8'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map-original');
      this._markers = [];
      this._boundsShapes = [];
      this._initWhenAvailable();
      $(this.options.searchElement).bind('simplicityResultSet', $.proxy(this._resultSetHandler, this));
    },
    /**
     * Lazy initialization method used to create the map only when the necessary JavaScript
     * is available. Intended to be called from any of this widgets public methods that need to
     * access the this._map.
     *
     * @name $.ui.simplicityYahooMapOriginal._initWhenAvailable
     * @function
     * @private
     */
    _initWhenAvailable: function () {
      var wasAvailable = 'undefined' !== typeof this._map;
      if (wasAvailable) {
        // Already available, do nothing
      } else if (this.options.map !== '') {
        this._map = this.options.map;
      } else if ('undefined' !== typeof YMap) {
        var defaultMapOptions = {
          center: new YGeoPoint(0, 0),
          zoom: 16,
          mapType: YAHOO_MAP_REG
        };
        var mapOptions;
        if (this.options.mapOptions === '') {
          mapOptions = defaultMapOptions;
        } else if ($.isFunction(this.options.mapOptions)) {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions.call(this));
        } else {
          mapOptions = $.extend(defaultMapOptions, this.options.mapOptions);
        }
        this._map = new YMap(this.element[0]);
        this._map.setMapType(mapOptions.mapType);
        this._map.drawZoomAndCenter(mapOptions.center, mapOptions.zoom);
        this._trigger('create', {}, {
          map: this._map
        });
      }
      var isAvailable = 'undefined' !== typeof this._map;
      if (!wasAvailable && isAvailable) {
        $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
          eventName = $.trim(eventName);
          if (eventName !== '') {
            YEvent.Capture(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
          }
        }, this));
      }
      return isAvailable;
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMapOriginal.map
     * @function
     */
    map: function () {
      return this._map;
    },
    /**
     * Try to dynamically load the necessary JavaScript from the upstream vendor that will
     * allow the map to function.
     *
     * @name $.ui.simplicityYahooMapOriginal.loadMap
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
     * @name $.ui.simplicityYahooMapOriginal.refreshMap
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
     * @name $.ui.simplicityYahooMapOriginal._resultSetHandler
     * @function
     * @private
     */
    _resultSetHandler: function (evt, resultSet) {
      if (this._initWhenAvailable()) {
        this.removeMarkers();
        this.addMarkers(resultSet);
      }
    },
    /**
     * Removes any markers that were added to the map by <code>addMarkers</code>.
     *
     * @name $.ui.simplicityYahooMapOriginal.removeMarkers
     * @function
     * @private
     */
    removeMarkers: function () {
      if (this._initWhenAvailable()) {
        $.each(this._markers, $.proxy(function (idx, marker) {
          this._map.removeOverlay(marker);
        }, this));
        this._markers.length = 0;
      }
    },
    /**
     * Adds any markers that can be extracted from the given <code>resultSet</code>.
     *
     * @name $.ui.simplicityYahooMapOriginal.addMarkers
     * @function
     * @private
     */
    addMarkers: function (resultSet) {
      if (this._initWhenAvailable()) {
        if (resultSet.rows.length > 0) {
          var locations = this.options.fitOnResultSet ? [] : null;
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
                  if (locations !== null) {
                    locations.push(point);
                  }
                  this._markers.push(marker);
                  this._map.addOverlay(marker);
                }
              }
            }
          }, this));
          if (locations !== null && locations.length > 0) {
            var bounds = this._map.getBestZoomAndCenter(locations);
            this._map.drawZoomAndCenter(bounds.YGeoPoint, bounds.zoomLevel);
          }
        }
      }
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityYahooMap: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityYahooMapOriginal.bounds
     * @function
     */
    bounds: function () {
      return this.normalizeBounds(this._map.getBoundsLatLon(), this._map.getCenterLatLon());
    },
    /**
     * Normalizes the bounds for this map.
     *
     * @param bounds in vendor supplied format
     * @param center point in vendor supplied format
     * @name $.ui.simplicityYahooMapOriginal.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.LatMax,
          east: bounds.LonMax,
          south: bounds.LatMin,
          west: bounds.LonMin
        },
        center: {
          vendor: center,
          latitude: center.Lat,
          longitude: center.Lon
        }
      };
      var radiusMiles1 = center.distance(new YGeoPoint(center.Lat, bounds.LonMax)).miles;
      var radiusMiles2 = center.distance(new YGeoPoint(bounds.LatMax, center.Lon)).miles;
      var minMiles = Math.min(radiusMiles1, radiusMiles2);
      var maxMiles = Math.max(radiusMiles1, radiusMiles2);
      $.extend(result, {
        minRadius: {
          meters: minMiles * 1609.344,
          feet: minMiles * 5280,
          miles:  minMiles,
          km: minMiles * 1.609344
        },
        maxRadius: {
          meters: maxMiles * 1609.344,
          feet: maxMiles * 5280,
          miles:  maxMiles,
          km: maxMiles * 1.609344
        }
      });
      return result;
    },
    /**
     * Removes the bounds from the map.
     *
     * @name $.ui.simplicityYahooMapOriginal.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      $.each(this._boundsShapes, $.proxy(function (idx, shape) {
        this._map.removeOverlay(shape);
      }, this));
      this._boundsShapes.length = 0;
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityYahooMapOriginal.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var shapes = {
        boundsRect: new YPolyline([
          new YGeoPoint(bounds.bounds.north, bounds.bounds.west),
          new YGeoPoint(bounds.bounds.north, bounds.bounds.east),
          new YGeoPoint(bounds.bounds.south, bounds.bounds.east),
          new YGeoPoint(bounds.bounds.south, bounds.bounds.west),
          new YGeoPoint(bounds.bounds.north, bounds.bounds.west)
        ], 'black', 3, 1),
        // minCircle and maxCircle fields are missing due to lack of support for circle entities.
        centerLatitude: new YPolyline([
          new YGeoPoint(bounds.center.latitude, bounds.bounds.east),
          new YGeoPoint(bounds.center.latitude, bounds.bounds.west)
        ], 'black', 1, 1),
        centerLongitude: new YPolyline([
          new YGeoPoint(bounds.bounds.north, bounds.center.longitude),
          new YGeoPoint(bounds.bounds.south, bounds.center.longitude)
        ], 'black', 1, 1)
      };
      this._trigger('boundsshapes', {}, shapes);
      $.each(shapes, $.proxy(function (name, shape) {
        this._map.addOverlay(shape);
        this._boundsShapes.push(shape);
      }, this));
    },
    destroy: function () {
      this.element.removeClass('ui-simplicity-yahoo-map-original');
      $(this.options.searchElement).unbind('simplicityResultSet', this._resultSetHandler);
      delete this._map;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
