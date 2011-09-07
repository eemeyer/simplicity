/**
 * @name $.ui.simplicityBingMapBoundsTracker
 * @namespace A Bing map.
 * <p>
 * An invisible jquery ui widget which tracks changes in a Bing Map's bounds. Whenever the map bound change, a
 * simplicitybingmapboundstrackerbounds event is triggered with ui.bounds being the normalized map bounds.
 *
 * @example
 *   &lt;div id="map" style="position: absolute; width: 300px; height: 300px;">&lt;/div>
 *   &lt;script type="text/javascript">
 *     $('#map').simplicityBingMapBoundsTracker({
 *       credentials: 'Your credentials go here'
 *     });
 *   &lt;/script>
 *
 * @see Bing Maps AJAX Control v7 <a href="http://msdn.microsoft.com/en-us/library/gg427610.aspx">documentation</a>.
 */
(function ($) {
  $.widget("ui.simplicityBingMapBoundsTracker", $.ui.simplicityWidget, {
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
     *     Defaults to <code>'viewchangeend'</code>.
     *   </dd>
     * </dl>
     * @name $.ui.simplicityBingMapBoundsTracker.options
     */
    options : {
      map: '',
      mapMoveEvents: 'viewchangeend'
    },
    _create : function () {
      this._addClass('ui-simplicity-bing-map-bounds-tracker');
      this._map = this.options.map !== '' ? this.options.map : this.element.simplicityBingMap('map');
      this._boundsShapes = [];
      this._boundsChangeListeners = {};
      // TODO: tie in to deferred loading of map API
      $.each(this.options.mapMoveEvents.split(','), $.proxy(function (idx, eventName) {
        eventName = $.trim(eventName);
        if (eventName !== '') {
          var listener;
          if (this.options.eventThrottleInterval === '') {
            listener = Microsoft.Maps.Events.addHandler(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this));
          } else {
            listener = Microsoft.Maps.Events.addThrottledHandler(this._map, eventName, $.proxy(this._mapBoundsChangeHandler, this), this.options.eventThrottleInterval);
          }
          this._boundsChangeListeners[eventName] = listener;
        }
      }, this));
    },
    /**
     * Return the actual map object.
     *
     * @name $.ui.simplicityBingMapBoundsTracker.map
     * @function
     */
    map: function () {
      return this._map;
    },
    _mapBoundsChangeHandler: function () {
      var bounds = this.bounds();
      if (this.options.debug) {
        console.log('simplicityBingMapBoundsTracker: Bounds changed', bounds);
      }
      this._trigger('bounds', {}, bounds);
    },
    /**
     * Returns the normalized bounds for this map.
     *
     * @name $.ui.simplicityBingMapBoundsTracker.bounds
     * @function
     */
    bounds: function () {
      return this.normalizeBounds(this._map.getBounds(), this._map.getCenter());
    },
    /**
     * Normalizes the bounds for this map.
     *
     * @param bounds in vendor supplied format
     * @param center point in vendor supplied format
     * @name $.ui.simplicityBingMapBoundsTracker.normalizeBounds
     * @function
     * @private
     */
    normalizeBounds: function (bounds, center) {
      var result = {
        map: this._map,
        bounds: {
          vendor: bounds,
          north: bounds.getNorth(),
          east: bounds.getEast(),
          south: bounds.getSouth(),
          west: bounds.getWest()
        },
        center: {
          vendor: center,
          latitude: center.latitude,
          longitude: center.longitude
        }
      };
      var radiusMiles1 = $.simplicityHaversineDistanceMiles(
        center.latitude, center.longitude, center.latitude, bounds.getEast());
      var radiusMiles2 = $.simplicityHaversineDistanceMiles(
        center.latitude, center.longitude, bounds.getNorth(), center.longitude);
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
     * @name $.ui.simplicityBingMapBoundsTracker.hideBounds
     * @function
     * @private
     */
    hideBounds: function () {
      $.each(this._boundsShapes, $.proxy(function (idx, shape) {
        this._map.entities.remove(shape);
      }, this));
      this._boundsShapes.length = 0;
    },
    /**
     * Adds an overlay for the bounds on the map.
     *
     * @param bounds Optional bounds to display, if missing the current bounds are used.
     * @name $.ui.simplicityBingMapBoundsTracker.showBounds
     * @function
     * @private
     */
    showBounds: function (bounds) {
      if ('undefined' === typeof bounds) {
        bounds = this.bounds();
      }
      var boundsRect = new Microsoft.Maps.Polygon([
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.west),
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.bounds.west),
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.bounds.west)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          fillColor: new Microsoft.Maps.Color(0)
        });
      var centerLatitude = new Microsoft.Maps.Polyline([
          new Microsoft.Maps.Location(bounds.center.latitude, bounds.bounds.east),
          new Microsoft.Maps.Location(bounds.center.latitude, bounds.bounds.west)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          strokeThickness: 1,
          fillColor: new Microsoft.Maps.Color(0)
        });
      var centerLongitude = new Microsoft.Maps.Polyline([
          new Microsoft.Maps.Location(bounds.bounds.north, bounds.center.longitude),
          new Microsoft.Maps.Location(bounds.bounds.south, bounds.center.longitude)
        ], {
          strokeColor: new Microsoft.Maps.Color(255, 0, 0, 0),
          strokeThickness: 1,
          fillColor: new Microsoft.Maps.Color(0)
        });
      var shapes = {
        boundsRect: boundsRect,
        // minCircle and maxCircle fields are missing due to lack of support for circle entities.
        centerLatutide: centerLatitude,
        centerLongitude: centerLongitude
      };
      this._trigger('boundsshapes', {}, shapes);
      $.each(shapes, $.proxy(function (name, shape) {
        this._map.entities.push(shape);
        this._boundsShapes.push(shape);
      }, this));
    },
    destroy: function () {
      $.each(this._boundsChangeListeners, $.proxy(function (eventName, listener) {
        Microsoft.Maps.Events.removeHandler(listener);
      }, this));
      this._boundsChangeListeners = {};
      delete this._boundsShapes;
      $.ui.simplicityWidget.prototype.destroy.apply(this, arguments);
    }
  });
}(jQuery));
