/**
 * @name $.ui.simplicityNokiaMapBoundsTracker
 * @namespace A Nokia map.
 * <p>
 * An invisible jquery ui widget which tracks changes in a Nokia Map's bounds. Whenever the map bound change, a
 * simplicitybingmapboundstrackerbounds event is triggered with ui.bounds being the normalized map bounds.
 *
 * @example
 *   &lt;div id="map" style="width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityNokiaMap();
 *   &lt;/script>
 *
 * @see Nokia Maps - JavaScript API <a href="http://api.maps.nokia.com/">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityNokiaMapBoundsTracker", $.ui.simplicityWidget, {
    /**
     * Widget options.
     *
     * <dl>
     *   <dt>map</dt>
     *   <dd>
     *     Optional map instance, if not provided one will be created. Defaults to <code>''</code>.
     *   </dd>
     *   <dt>mapMoveEvents</dt>
     *   <dd>
     *     Provides an override of which vendor specific map events are used to determine
     *     when the position of the map changes. Expects a comma separated list of event names.
     *     Defaults to <code>'mapviewchangeend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityNokiaMapBoundsTracker.options
     */
    options : {
      map: '',
      mapMoveEvents: 'mapviewchangeend'
    },
    _create: function () {
      this._addClass('ui-simplicity-nokia-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityNokiaMap('map');
      this._boundsShapes = [];
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          this._map.addListener(eventName, $.proxy(this._mapBoundsChangeHandler, this), false);
        }
      }, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityNokiaMapBoundsTracker.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityNokiaMapBoundsTracker: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityNokiaMapBoundsTracker.bounds
     * @function
     */
    bounds: function () {
      return this.normalizeBounds(this._map.getViewBounds(), this._map.center);
    },
    /**
     * Normalizes the bounds for this map.
     *
     * @param bounds in vendor supplied format
     * @param center point in vendor supplied format
     * @name $.ui.simplicityNokiaMapBoundsTracker.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.topLeft.latitude,
          east: bounds.bottomRight.longitude,
          south: bounds.bottomRight.latitude,
          west: bounds.topLeft.longitude
        },
        center: {
          vendor: center,
          latitude: center.latitude,
          longitude: center.longitude
        }
      };
      var radiusMeters1 = center.distance(new nokia.maps.geo.Coordinate(center.latitude, bounds.bottomRight.longitude));
      var radiusMeters2 = center.distance(new nokia.maps.geo.Coordinate(bounds.topLeft.latitude, center.longitude));
      var minMeters = Math.min(radiusMeters1, radiusMeters2);
      var maxMeters = Math.max(radiusMeters1, radiusMeters2);
      $.extend(result, {
        minRadius: {
          meters: minMeters,
          feet: minMeters * 3.2808399,
          miles:  minMeters / 1609.344,
          km: minMeters / 1000
        },
        maxRadius: {
          meters: maxMeters,
          feet: maxMeters * 3.2808399,
          miles:  maxMeters / 1609.344,
          km: maxMeters / 1000
        }
      });
      return result;
    },
    /**
     * Removes the bounds from the map.
     *
     * @name $.ui.simplicityNokiaMapBoundsTracker.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      $.each(this._boundsShapes, $.proxy(function (idx, shape) {
        this._map.objects.remove(shape);
      }, this));
      this._boundsShapes.length = 0;
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityNokiaMapBoundsTracker.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var drawProperties = {
        color: '#000',
        width: 2,
        fillColor: '#0000'
      };
      var shapes = {
        boundsRect: new nokia.maps.map.Polygon([
          new nokia.maps.geo.Coordinate(bounds.bounds.north, bounds.bounds.west),
          new nokia.maps.geo.Coordinate(bounds.bounds.north, bounds.bounds.east),
          new nokia.maps.geo.Coordinate(bounds.bounds.south, bounds.bounds.east),
          new nokia.maps.geo.Coordinate(bounds.bounds.south, bounds.bounds.west)
        ], drawProperties),
        minCircle: new nokia.maps.map.Circle(bounds.center.vendor, bounds.minRadius.meters, drawProperties),
        maxCircle: new nokia.maps.map.Circle(bounds.center.vendor, bounds.maxRadius.meters, drawProperties),
        centerLatitude: new nokia.maps.map.Polyline([
          new nokia.maps.geo.Coordinate(bounds.center.latitude, bounds.bounds.east),
          new nokia.maps.geo.Coordinate(bounds.center.latitude, bounds.bounds.west)
        ], drawProperties),
        centerLongitude: new nokia.maps.map.Polyline([
          new nokia.maps.geo.Coordinate(bounds.bounds.north, bounds.center.longitude),
          new nokia.maps.geo.Coordinate(bounds.bounds.south, bounds.center.longitude)
        ], drawProperties)
      };
      this._trigger('boundsshapes', {}, shapes);
      $.each(shapes, $.proxy(function (name, shape) {
        this._map.objects.add(shape);
        this._boundsShapes.push(shape);
      }, this));
    },
    destroy: function () {
      delete this._boundsShapes;
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
