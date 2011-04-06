/**
 * @name $.ui.simplicityYahooMapBoundsTracker
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
  $.widget("ui.simplicityYahooMapBoundsTracker", {
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
     * @name $.ui.simplicityYahooMapBoundsTracker.options
     */
    options : {
      map: '',
      mapMoveEvents: 'endPan,endAutoPan,changeZoom'
    },
    _create: function () {
      this.element.addClass('ui-simplicity-yahoo-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityYahooMap('map');
      this._boundsShapes = [];
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          YEvent.Capture(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
        }
      }, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityYahooMapBoundsTracker.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityYahooMapBoundsTracker: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityYahooMapBoundsTracker.bounds
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
     * @name $.ui.simplicityYahooMapBoundsTracker.normalizeBounds
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
     * @name $.ui.simplicityYahooMapBoundsTracker.hideBounds
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
     * @name $.ui.simplicityYahooMapBoundsTracker.showBounds
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
      this.element.removeClass('ui-simplicity-yahoo-map-bounds-tracker');
      delete this._map;
      delete this._boundsShapes;
      $.Widget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
